/**
 * 🥇 EMOTIONAL TWINS - Voice Emotion Analysis Service
 * 
 * This is a simplified version that analyzes basic voice characteristics.
 * For production, integrate with Hume AI or Affectiva for advanced emotion detection.
 */

export interface VoiceEmotionProfile {
    userId: string;
    primaryEmotion: string;
    emotionScores: Record<string, number>;
    voiceCharacteristics: {
        tone: 'calm' | 'anxious' | 'sad' | 'energetic';
        pace: 'slow' | 'normal' | 'fast';
        energy: number; // 0-100
    };
    recordedAt: Date;
    signature: string; // Unique identifier for matching
}

export interface EmotionalTwinMatch {
    userId1: string;
    userId2: string;
    matchScore: number; // 0-100
    sharedEmotions: string[];
    matchedCharacteristics: string[];
}

/**
 * Analyze voice characteristics from user input
 * This is a simplified version - in production, use Hume AI or similar
 */
export function analyzeVoiceFromSurvey(surveyData: {
    emotionalTheme: string;
    emotionalIntensity: number;
    comfortLevel: string;
    selectedWords: string[]; // Words user selects to describe their feelings
}): VoiceEmotionProfile {
    const { emotionalTheme, emotionalIntensity, comfortLevel, selectedWords } = surveyData;

    // Map themes to primary emotions
    const themeToEmotion: Record<string, string> = {
        'loneliness': 'Sadness',
        'work-stress': 'Anxiety',
        'breakup': 'Sadness',
        'anxiety': 'Anxiety',
        'stuck': 'Frustration',
        'grief': 'Sadness',
        'overwhelmed': 'Anxiety',
        'other': 'Mixed',
    };

    const primaryEmotion = themeToEmotion[emotionalTheme] || 'Neutral';

    // Calculate emotion scores based on theme and intensity
    const emotionScores: Record<string, number> = {
        'Sadness': 0,
        'Anxiety': 0,
        'Joy': 0,
        'Anger': 0,
        'Fear': 0,
        'Calmness': 0,
    };

    // Set primary emotion score based on intensity
    emotionScores[primaryEmotion] = emotionalIntensity / 10;

    // Add secondary emotions based on theme
    if (emotionalTheme === 'loneliness') {
        emotionScores['Sadness'] = emotionalIntensity / 10;
        emotionScores['Fear'] = (emotionalIntensity / 10) * 0.5;
        emotionScores['Calmness'] = 1 - (emotionalIntensity / 10);
    } else if (emotionalTheme === 'anxiety' || emotionalTheme === 'work-stress') {
        emotionScores['Anxiety'] = emotionalIntensity / 10;
        emotionScores['Fear'] = (emotionalIntensity / 10) * 0.6;
        emotionScores['Calmness'] = 1 - (emotionalIntensity / 10);
    } else if (emotionalTheme === 'overwhelmed') {
        emotionScores['Anxiety'] = emotionalIntensity / 10;
        emotionScores['Sadness'] = (emotionalIntensity / 10) * 0.4;
        emotionScores['Anger'] = (emotionalIntensity / 10) * 0.3;
    }

    // Determine voice characteristics
    let tone: 'calm' | 'anxious' | 'sad' | 'energetic' = 'calm';
    let pace: 'slow' | 'normal' | 'fast' = 'normal';
    let energy = 50;

    if (emotionScores['Anxiety'] > 0.6) {
        tone = 'anxious';
        pace = 'fast';
        energy = 70 + (emotionScores['Anxiety'] * 30);
    } else if (emotionScores['Sadness'] > 0.6) {
        tone = 'sad';
        pace = 'slow';
        energy = 30 - (emotionScores['Sadness'] * 20);
    } else if (emotionScores['Calmness'] > 0.6) {
        tone = 'calm';
        pace = 'normal';
        energy = 40 + (emotionScores['Calmness'] * 20);
    } else {
        tone = 'energetic';
        pace = 'normal';
        energy = 60;
    }

    // Adjust based on comfort level
    if (comfortLevel === 'just-listening') {
        energy = Math.max(20, energy - 20);
        pace = 'slow';
    } else if (comfortLevel === 'comfortable') {
        energy = Math.min(80, energy + 10);
    }

    // Create unique signature
    const signature = `${primaryEmotion}-${tone}-${pace}-${Math.round(energy)}`;

    return {
        userId: '',
        primaryEmotion,
        emotionScores,
        voiceCharacteristics: {
            tone,
            pace,
            energy,
        },
        recordedAt: new Date(),
        signature,
    };
}

/**
 * Calculate Emotional Twin Score between two profiles
 */
export function calculateEmotionalTwinScore(
    profile1: VoiceEmotionProfile,
    profile2: VoiceEmotionProfile
): number {
    let score = 0;

    // 1. Primary Emotion Match (30 points)
    if (profile1.primaryEmotion === profile2.primaryEmotion) {
        score += 30;
    }

    // 2. Voice Tone Match (25 points)
    if (profile1.voiceCharacteristics.tone === profile2.voiceCharacteristics.tone) {
        score += 25;
    }

    // 3. Emotion Scores Similarity (30 points)
    const emotions = ['Sadness', 'Anxiety', 'Joy', 'Anger', 'Fear', 'Calmness'];
    let emotionSimilarity = 0;
    emotions.forEach(emotion => {
        const score1 = profile1.emotionScores[emotion] || 0;
        const score2 = profile2.emotionScores[emotion] || 0;
        const diff = Math.abs(score1 - score2);
        emotionSimilarity += (1 - diff) * 5; // Max 5 points per emotion
    });
    score += emotionSimilarity;

    // 4. Energy Level Similarity (15 points)
    const energyDiff = Math.abs(
        profile1.voiceCharacteristics.energy - profile2.voiceCharacteristics.energy
    );
    score += Math.max(0, 15 - (energyDiff / 100 * 15));

    return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Find emotional twins for a user
 */
export function findEmotionalTwins(
    userProfile: VoiceEmotionProfile,
    allProfiles: VoiceEmotionProfile[],
    minScore: number = 70
): EmotionalTwinMatch[] {
    const matches: EmotionalTwinMatch[] = [];

    allProfiles.forEach(otherProfile => {
        if (otherProfile.userId === userProfile.userId) {
            return; // Skip self
        }

        const matchScore = calculateEmotionalTwinScore(userProfile, otherProfile);

        if (matchScore >= minScore) {
            // Find shared emotions (scores > 0.5)
            const sharedEmotions: string[] = [];
            Object.keys(userProfile.emotionScores).forEach(emotion => {
                if (
                    userProfile.emotionScores[emotion] > 0.5 &&
                    otherProfile.emotionScores[emotion] > 0.5
                ) {
                    sharedEmotions.push(emotion);
                }
            });

            // Find matched characteristics
            const matchedCharacteristics: string[] = [];
            if (userProfile.primaryEmotion === otherProfile.primaryEmotion) {
                matchedCharacteristics.push(`Both feeling ${userProfile.primaryEmotion.toLowerCase()}`);
            }
            if (userProfile.voiceCharacteristics.tone === otherProfile.voiceCharacteristics.tone) {
                matchedCharacteristics.push(`Similar ${userProfile.voiceCharacteristics.tone} tone`);
            }
            if (Math.abs(userProfile.voiceCharacteristics.energy - otherProfile.voiceCharacteristics.energy) < 20) {
                matchedCharacteristics.push('Similar energy levels');
            }

            matches.push({
                userId1: userProfile.userId,
                userId2: otherProfile.userId,
                matchScore,
                sharedEmotions,
                matchedCharacteristics,
            });
        }
    });

    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get emotion color for visualization
 */
export function getEmotionColor(emotion: string): string {
    const colorMap: Record<string, string> = {
        'Sadness': '#6B7FD7',      // Soft blue
        'Anxiety': '#FF6B9D',      // Pink
        'Joy': '#FFD93D',          // Yellow
        'Anger': '#FF6B6B',        // Red
        'Fear': '#9D4EDD',         // Purple
        'Calmness': '#98D8C8',     // Mint
        'Mixed': '#B8A7D9',        // Lavender
    };

    return colorMap[emotion] || '#B8A7D9';
}

/**
 * Get emotion emoji
 */
export function getEmotionEmoji(emotion: string): string {
    const emojiMap: Record<string, string> = {
        'Sadness': '😔',
        'Anxiety': '😰',
        'Joy': '😊',
        'Anger': '😠',
        'Fear': '😨',
        'Calmness': '😌',
        'Mixed': '🤔',
    };

    return emojiMap[emotion] || '🤔';
}
