import { v4 as uuidv4 } from 'uuid';
import { getMatchingQueue, removeFromMatchingQueue } from '../config/redis';
import { getPool } from '../config/database';
import { MatchingRequest, CircleSession } from '../models/types';
import { generateVoiceRoomToken } from './voice.service';
import { isMidnightHours, getSunriseTime, getMidnightTheme, shouldCreateMidnightCircle } from './midnight.service';

const MIN_CIRCLE_SIZE = parseInt(process.env.MIN_CIRCLE_SIZE || '3');
const MAX_CIRCLE_SIZE = parseInt(process.env.MAX_CIRCLE_SIZE || '4');

/**
 * Find matches in the queue and create circles
 */
export async function findMatches(): Promise<void> {
    try {
        const queue = await getMatchingQueue();

        if (queue.length < MIN_CIRCLE_SIZE) {
            // Silently skip if not enough users
            return;
        }

        // Group users by theme
        const themeGroups: { [key: string]: MatchingRequest[] } = {};

        queue.forEach((request: MatchingRequest) => {
            if (!themeGroups[request.theme]) {
                themeGroups[request.theme] = [];
            }
            themeGroups[request.theme].push(request);
        });

        // Create circles for each theme that has enough users
        for (const [theme, users] of Object.entries(themeGroups)) {
            while (users.length >= MIN_CIRCLE_SIZE) {
                // Take 3-4 users with similar intensity and comfort levels
                const matchedUsers = findBestMatch(users.slice(0, MAX_CIRCLE_SIZE));

                if (matchedUsers.length >= MIN_CIRCLE_SIZE) {
                    await createCircle(matchedUsers);

                    // Remove matched users from the queue
                    for (const user of matchedUsers) {
                        await removeFromMatchingQueue(user.sessionId);
                        const index = users.indexOf(user);
                        if (index > -1) {
                            users.splice(index, 1);
                        }
                    }
                } else {
                    break;
                }
            }
        }
    } catch (error) {
        // Silently skip if Redis is not initialized (development mode)
        if (error instanceof Error && error.message.includes('Redis not initialized')) {
            return;
        }
        console.error('Error finding matches:', error);
    }
}

/**
 * Find the best match among users based on intensity and comfort level
 */
function findBestMatch(users: MatchingRequest[]): MatchingRequest[] {
    if (users.length <= MIN_CIRCLE_SIZE) {
        return users;
    }

    // Sort by intensity to group similar emotional states
    users.sort((a, b) => a.intensity - b.intensity);

    // Take users with similar intensity (within 3 points)
    const matched: MatchingRequest[] = [users[0]];
    const baseIntensity = users[0].intensity;

    for (let i = 1; i < users.length && matched.length < MAX_CIRCLE_SIZE; i++) {
        if (Math.abs(users[i].intensity - baseIntensity) <= 3) {
            matched.push(users[i]);
        }
    }

    return matched;
}

async function createCircle(users: MatchingRequest[]): Promise<CircleSession> {
    const circleId = uuidv4();
    let theme = users[0].theme;
    const duration = users[0].duration;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // 🌙 Determine if this should be a midnight circle
    const circleType = shouldCreateMidnightCircle(theme) ? 'midnight' : 'standard';
    const autoDeleteAt = circleType === 'midnight' ? getSunriseTime() : null;

    // Use special midnight theme if applicable
    if (circleType === 'midnight') {
        theme = getMidnightTheme() as any; // Cast to any to allow midnight themes
        console.log(`🌙 Creating MIDNIGHT circle: "${theme}"`);
    }

    // Generate voice room credentials (Agora)
    const voiceCredentials = await generateVoiceRoomToken(circleId);

    const circle: CircleSession = {
        circleId,
        participants: users.map(u => u.sessionId),
        theme,
        startTime,
        endTime,
        status: 'waiting',
        voiceRoomToken: voiceCredentials.token,
        voiceAppId: voiceCredentials.appId,
        voiceChannelName: voiceCredentials.channelName,
        voiceRoomUrl: undefined, // Deprecated
        aiModeratorActive: true,
        createdAt: new Date()
    };

    // Save to database
    const pool = getPool();
    await pool.query(
        `INSERT INTO circle_sessions 
     (circle_id, participants, theme, start_time, end_time, status, voice_room_token, voice_app_id, voice_channel_name, ai_moderator_active, circle_type, auto_delete_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
            circle.circleId,
            circle.participants,
            circle.theme,
            circle.startTime,
            circle.endTime,
            circle.status,
            circle.voiceRoomToken,
            circle.voiceAppId,
            circle.voiceChannelName,
            circle.aiModeratorActive,
            circleType,
            autoDeleteAt,
            circle.createdAt
        ]
    );

    const circleTypeEmoji = circleType === 'midnight' ? '🌙' : '✓';
    console.log(`${circleTypeEmoji} Created ${circleType} circle ${circleId} with ${users.length} participants (theme: ${theme})`);

    // Notify all participants via WebSocket that their match is ready
    try {
        const { io } = require('../index');

        for (const user of users) {
            console.log(`📤 Notifying ${user.sessionId} about match: ${circleId}`);

            // Emit to the specific session's room
            io.to(user.sessionId).emit('match_found', {
                circleId: circle.circleId,
                theme: circle.theme,
                participantCount: circle.participants.length,
                startTime: circle.startTime,
                endTime: circle.endTime,
                // Voice credentials for Agora
                voiceToken: circle.voiceRoomToken,
                voiceAppId: circle.voiceAppId,
                voiceChannelName: circle.voiceChannelName,
            });
        }

        console.log(`✅ Sent WebSocket notifications to ${users.length} participants`);
    } catch (error) {
        console.error('❌ Error sending WebSocket notifications:', error);
        // Don't fail the circle creation if WebSocket fails
    }

    return circle;
}

/**
 * Calculate compatibility score between two users
 */
function calculateCompatibility(user1: MatchingRequest, user2: MatchingRequest): number {
    let score = 0;

    // Same theme (required)
    if (user1.theme === user2.theme) {
        score += 50;
    } else {
        return 0; // Must have same theme
    }

    // Similar intensity (max 30 points)
    const intensityDiff = Math.abs(user1.intensity - user2.intensity);
    score += Math.max(0, 30 - (intensityDiff * 5));

    // Compatible comfort levels (max 20 points)
    if (user1.comfortLevel === user2.comfortLevel) {
        score += 20;
    } else if (
        (user1.comfortLevel === 'sharing-sometimes' && user2.comfortLevel === 'comfortable') ||
        (user1.comfortLevel === 'comfortable' && user2.comfortLevel === 'sharing-sometimes')
    ) {
        score += 10;
    }

    return score;
}

// Run matching every 30 seconds
setInterval(() => {
    findMatches().catch(console.error);
}, 30000);
