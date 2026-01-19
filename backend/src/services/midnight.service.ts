import { getPool } from '../config/database';

/**
 * 🌙 MIDNIGHT CIRCLES SERVICE
 * Handles time-based circle logic and auto-deletion
 */

/**
 * Check if current time is within midnight hours (11 PM - 3 AM)
 */
export function isMidnightHours(): boolean {
    const hour = new Date().getHours();
    return hour >= 23 || hour < 3;
}

/**
 * Get the next midnight window start time
 */
export function getNextMidnightTime(): Date {
    const now = new Date();
    const next = new Date(now);

    const currentHour = now.getHours();

    if (currentHour >= 3 && currentHour < 23) {
        // Next midnight is tonight at 11 PM
        next.setHours(23, 0, 0, 0);
    } else {
        // Currently in midnight window, return current time
        return now;
    }

    return next;
}

/**
 * Get the next sunrise time (6 AM) for auto-deletion
 */
export function getSunriseTime(): Date {
    const now = new Date();
    const sunrise = new Date(now);

    const currentHour = now.getHours();

    if (currentHour < 6) {
        // Today's sunrise
        sunrise.setHours(6, 0, 0, 0);
    } else {
        // Tomorrow's sunrise
        sunrise.setDate(sunrise.getDate() + 1);
        sunrise.setHours(6, 0, 0, 0);
    }

    return sunrise;
}

/**
 * Calculate time remaining until next midnight window
 */
export function getTimeUntilMidnight(): {
    hours: number;
    minutes: number;
    totalMinutes: number;
} {
    const now = new Date();
    const nextMidnight = getNextMidnightTime();

    const diff = nextMidnight.getTime() - now.getTime();
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { hours, minutes, totalMinutes };
}

/**
 * Auto-delete midnight circles at sunrise (6 AM)
 */
export async function deleteMidnightCircles(): Promise<void> {
    try {
        const pool = getPool();

        // Delete expired midnight circles
        const result = await pool.query(`
            DELETE FROM circle_sessions 
            WHERE circle_type = 'midnight' 
            AND auto_delete_at < NOW()
            RETURNING circle_id
        `);

        if (result.rowCount && result.rowCount > 0) {
            console.log(`🌅 Deleted ${result.rowCount} midnight circles at sunrise`);

            // Also delete their summaries
            const circleIds = result.rows.map((row: any) => row.circle_id);
            if (circleIds.length > 0) {
                await pool.query(`
                    DELETE FROM session_summaries 
                    WHERE circle_id = ANY($1)
                `, [circleIds]);

                console.log(`🌅 Deleted summaries for ${circleIds.length} midnight circles`);
            }
        }
    } catch (error) {
        console.error('Error deleting midnight circles:', error);
        // Don't throw - this is a background task
    }
}

/**
 * Get midnight circle theme based on current vibe
 */
export function getMidnightTheme(): string {
    const themes = [
        'Late Night Confessions',
        'Midnight Vulnerability',
        'After Dark Thoughts',
        'Insomnia Circle',
        'Night Owl Support',
        '3 AM Realizations',
    ];

    // Rotate theme based on day of week
    const dayOfWeek = new Date().getDay();
    return themes[dayOfWeek % themes.length];
}

/**
 * Check if a circle should be midnight type
 */
export function shouldCreateMidnightCircle(theme: string): boolean {
    // Only create midnight circles during midnight hours
    if (!isMidnightHours()) {
        return false;
    }

    // Midnight circles for specific themes
    const midnightThemes = [
        'loneliness',
        'anxiety',
        'overwhelmed',
        'insomnia',
    ];

    return midnightThemes.includes(theme.toLowerCase());
}

// Run cleanup every hour
let cleanupInterval: NodeJS.Timeout | null = null;

export function startMidnightCleanup(): void {
    if (cleanupInterval) {
        return; // Already running
    }

    console.log('🌙 Starting midnight circle cleanup service');

    // Run immediately
    deleteMidnightCircles();

    // Then run every hour
    cleanupInterval = setInterval(() => {
        deleteMidnightCircles();
    }, 60 * 60 * 1000); // Every hour
}

export function stopMidnightCleanup(): void {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
        console.log('🌙 Stopped midnight circle cleanup service');
    }
}
