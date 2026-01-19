import { Router, Request, Response } from 'express';
import { addToMatchingQueue, removeFromMatchingQueue, getMatchingQueue } from '../config/redis';
import { MatchingRequest } from '../models/types';
import { findMatches } from '../services/matching.service';

const router = Router();

/**
 * POST /api/matching/join
 * Join the matching queue
 */
router.post('/join', async (req: Request, res: Response) => {
    try {
        const {
            sessionId,
            theme,
            intensity,
            comfortLevel,
            timezone,
            duration
        } = req.body;

        // Validation
        if (!sessionId || !theme || !intensity || !comfortLevel || !timezone || !duration) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['sessionId', 'theme', 'intensity', 'comfortLevel', 'timezone', 'duration']
            });
        }

        const matchingRequest: MatchingRequest = {
            sessionId,
            theme,
            intensity,
            comfortLevel,
            timezone,
            duration,
            timestamp: new Date()
        };

        // Add to Redis queue
        await addToMatchingQueue(sessionId, matchingRequest);

        // Try to find matches immediately
        const matches = await findMatches();

        res.json({
            message: 'Added to matching queue',
            queuePosition: await getQueuePosition(sessionId),
            estimatedWaitTime: '1-2 minutes'
        });
    } catch (error) {
        console.error('Error joining matching queue:', error);
        res.status(500).json({ error: 'Failed to join matching queue' });
    }
});

/**
 * DELETE /api/matching/leave
 * Leave the matching queue
 */
router.delete('/leave', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        await removeFromMatchingQueue(sessionId);

        res.json({ message: 'Removed from matching queue' });
    } catch (error) {
        console.error('Error leaving matching queue:', error);
        res.status(500).json({ error: 'Failed to leave matching queue' });
    }
});

/**
 * GET /api/matching/status
 * Check matching status
 */
router.get('/status/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const queue = await getMatchingQueue();
        const inQueue = queue.some((item: any) => item.sessionId === sessionId);

        if (!inQueue) {
            return res.json({
                status: 'not_in_queue',
                message: 'Not currently in matching queue'
            });
        }

        const position = await getQueuePosition(sessionId);

        res.json({
            status: 'waiting',
            queuePosition: position,
            estimatedWaitTime: '1-2 minutes'
        });
    } catch (error) {
        console.error('Error checking matching status:', error);
        res.status(500).json({ error: 'Failed to check matching status' });
    }
});

// Helper function to get queue position
async function getQueuePosition(sessionId: string): Promise<number> {
    const queue = await getMatchingQueue();
    const index = queue.findIndex((item: any) => item.sessionId === sessionId);
    return index >= 0 ? index + 1 : -1;
}

export default router;
