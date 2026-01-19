import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

export async function initializeRedis(): Promise<void> {
    // Skip Redis initialization if REDIS_URL is not configured
    if (!process.env.REDIS_URL) {
        console.warn('⚠️  REDIS_URL not configured - skipping Redis initialization');
        console.warn('   Matching queue features will not be available');
        return;
    }

    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
        console.log('Redis connected');
    });

    await redisClient.connect();
}

export function getRedisClient(): RedisClientType {
    if (!redisClient) {
        throw new Error('Redis not initialized. Call initializeRedis() first.');
    }
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
    await client.hSet('matching_queue', sessionId, JSON.stringify(data));
}

export async function removeFromMatchingQueue(sessionId: string): Promise<void> {
    const client = getRedisClient();
    await client.hDel('matching_queue', sessionId);
}

export async function getMatchingQueue(): Promise<any[]> {
    const client = getRedisClient();
    const queue = await client.hGetAll('matching_queue');
    return Object.values(queue).map(item => JSON.parse(item));
}

export async function clearMatchingQueue(): Promise<void> {
    const client = getRedisClient();
    await client.del('matching_queue');
}
