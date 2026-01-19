import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function initializeRedis(): Promise<void> {
    // Debug: Log the REDIS_URL (without exposing password)
    const redisUrl = process.env.REDIS_URL;
    console.log('🔍 REDIS_URL exists:', !!redisUrl);
    if (redisUrl) {
        console.log('🔍 REDIS_URL starts with:', redisUrl.substring(0, 10));
    }

    // Skip Redis initialization if REDIS_URL is not configured or invalid
    if (!redisUrl || redisUrl === '' || redisUrl === 'undefined') {
        console.warn('⚠️  REDIS_URL not configured - Redis features disabled');
        console.warn('   App will work without matching queue features');
        return;
    }

    try {
        console.log('🔄 Attempting to connect to Redis...');
        redisClient = createClient({
            url: redisUrl
        });

        redisClient.on('error', (err) => {
            console.error('Redis error:', err);
        });

        redisClient.on('connect', () => {
            console.log('✓ Redis connected');
        });

        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        console.warn('⚠️  Continuing without Redis - matching queue disabled');
        redisClient = null;
    }
}

export function getRedisClient(): RedisClientType | null {
    return redisClient;
}

export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
    }
}

// Helper functions for matching queue
export async function addToMatchingQueue(sessionId: string, data: any): Promise<void> {
    const client = getRedisClient();
    if (!client) {
        console.warn('Redis not available - skipping queue operation');
        return;
    }
    await client.hSet('matching_queue', sessionId, JSON.stringify(data));
}

export async function removeFromMatchingQueue(sessionId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.hDel('matching_queue', sessionId);
}

export async function getMatchingQueue(): Promise<any[]> {
    const client = getRedisClient();
    if (!client) return [];
    const queue = await client.hGetAll('matching_queue');
    return Object.values(queue).map(item => JSON.parse(item));
}

export async function clearMatchingQueue(): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.del('matching_queue');
}

