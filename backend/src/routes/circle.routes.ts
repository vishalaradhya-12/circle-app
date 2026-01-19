import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { CircleSession, SafetyReport } from '../models/types';
import { generateVoiceRoomToken } from '../services/voice.service';
import { generateSessionSummary, generateEmotionalRouletteQuestion } from '../services/ai.service';

const router = Router();

/**
 * GET /api/circles/:id
 * Get circle details including voice credentials
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Handle demo circles
        if (id.startsWith('demo-')) {
            const channelName = `circle_${id}`;
            const voiceRoomToken = await generateVoiceRoomToken(channelName, '0');

            return res.json({
                circleId: id,
                theme: 'Demo Circle',
                participantCount: 1,
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
                voiceAppId: process.env.AGORA_APP_ID,
                voiceChannelName: channelName,
                voiceRoomToken: voiceRoomToken,
                status: 'active'
            });
        }

        const pool = getPool();
        const result = await pool.query(
            'SELECT * FROM circle_sessions WHERE circle_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Circle not found' });
        }

        const circle = result.rows[0];

        res.json({
            circleId: circle.circle_id,
            theme: circle.theme,
            participantCount: circle.participant_count,
            startTime: circle.start_time,
            endTime: circle.end_time,
            voiceAppId: process.env.AGORA_APP_ID,
            voiceChannelName: circle.voice_channel_name,
            voiceRoomToken: circle.voice_room_token,
            status: circle.status
        });
    } catch (error) {
        console.error('Error getting circle:', error);
        res.status(500).json({ error: 'Failed to get circle' });
    }
});

/**
 * POST /api/circle/join
 * Join a matched circle
 */
router.post('/join', async (req: Request, res: Response) => {
    try {
        const { circleId, sessionId } = req.body;

        if (!circleId || !sessionId) {
            return res.status(400).json({ error: 'circleId and sessionId are required' });
        }

        const pool = getPool();
        const result = await pool.query(
            'SELECT * FROM circle_sessions WHERE circle_id = $1',
            [circleId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Circle not found' });
        }

        const circle = result.rows[0];

        if (circle.status !== 'waiting') {
            return res.status(400).json({ error: 'Circle is not accepting new participants' });
        }

        res.json({
            circle: {
                circleId: circle.circle_id,
                theme: circle.theme,
                startTime: circle.start_time,
                endTime: circle.end_time,
                voiceRoomUrl: circle.voice_room_url,
                voiceRoomToken: circle.voice_room_token
            },
            message: 'Successfully joined circle'
        });
    } catch (error) {
        console.error('Error joining circle:', error);
        res.status(500).json({ error: 'Failed to join circle' });
    }
});

/**
 * POST /api/circle/leave
 * Leave a circle
 */
router.post('/leave', async (req: Request, res: Response) => {
    try {
        const { circleId, sessionId } = req.body;

        if (!circleId || !sessionId) {
            return res.status(400).json({ error: 'circleId and sessionId are required' });
        }

        // In a real implementation, you would update the participants list
        // For now, we'll just acknowledge the request

        res.json({ message: 'Successfully left circle' });
    } catch (error) {
        console.error('Error leaving circle:', error);
        res.status(500).json({ error: 'Failed to leave circle' });
    }
});

/**
 * GET /api/circle/:id/token
 * Get voice room token for a circle
 */
router.get('/:id/token', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const pool = getPool();
        const result = await pool.query(
            'SELECT voice_room_token, voice_room_url FROM circle_sessions WHERE circle_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Circle not found' });
        }

        const { voice_room_token, voice_room_url } = result.rows[0];

        res.json({
            token: voice_room_token,
            url: voice_room_url
        });
    } catch (error) {
        console.error('Error getting voice token:', error);
        res.status(500).json({ error: 'Failed to get voice token' });
    }
});

/**
 * POST /api/circle/:id/report
 * Report a safety issue
 */
router.post('/:id/report', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { sessionId, reason, severity, details } = req.body;

        if (!sessionId || !reason) {
            return res.status(400).json({ error: 'sessionId and reason are required' });
        }

        const reportId = uuidv4();
        const pool = getPool();

        // Determine severity level
        const reportSeverity = severity || 'medium';
        let actionTaken = 'Under review';

        // Save report
        await pool.query(
            `INSERT INTO safety_reports (report_id, circle_id, reporter_session_id, reason, timestamp, action_taken)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
            [reportId, id, sessionId, `${reason}${details ? ': ' + details : ''}`, actionTaken]
        );

        // Automatic actions based on severity
        if (reportSeverity === 'high' || reason.toLowerCase().includes('harassment') || reason.toLowerCase().includes('abuse')) {
            // Immediately terminate the circle
            await pool.query(
                `UPDATE circle_sessions SET status = 'terminated' WHERE circle_id = $1`,
                [id]
            );

            actionTaken = 'Circle terminated immediately';

            // Update report with action taken
            await pool.query(
                `UPDATE safety_reports SET action_taken = $1 WHERE report_id = $2`,
                [actionTaken, reportId]
            );

            console.log(`🛡️ SAFETY: Circle ${id} terminated due to ${reportSeverity} severity report`);
        } else {
            // Flag for review
            actionTaken = 'Flagged for moderator review';
            await pool.query(
                `UPDATE safety_reports SET action_taken = $1 WHERE report_id = $2`,
                [actionTaken, reportId]
            );

            console.log(`🛡️ SAFETY: Report ${reportId} flagged for review`);
        }

        res.json({
            reportId,
            message: 'Safety report submitted. Thank you for helping keep CIRCLE safe.',
            actionTaken,
            supportMessage: 'If you feel unsafe, please leave the circle immediately. Your safety is our priority.'
        });
    } catch (error) {
        console.error('Error submitting safety report:', error);
        res.status(500).json({ error: 'Failed to submit safety report' });
    }
});

/**
 * GET /api/circle/:id/summary
 * Get post-session summary
 */
router.get('/:id/summary', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pool = getPool();
        const result = await pool.query(
            `SELECT * FROM session_summaries WHERE circle_id = $1 AND expires_at > NOW()`,
            [id]
        );

        if (result.rows.length === 0) {
            // Generate summary if it doesn't exist
            const summary = await generateSessionSummary(id);
            return res.json({ summary });
        }

        const row = result.rows[0];
        const summary = {
            circleId: row.circle_id,
            commonEmotions: row.common_emotions,
            speakingBalance: row.speaking_balance,
            sentimentTrend: row.sentiment_trend,
            validationMessage: row.validation_message,
            createdAt: row.created_at
        };

        res.json({ summary });
    } catch (error) {
        console.error('Error getting session summary:', error);
        res.status(500).json({ error: 'Failed to get session summary' });
    }
});

/**
 * 🎲 POST /api/circle/:id/roulette
 * Get an Emotional Roulette question
 */
router.post('/:id/roulette', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { trustLevel = 1, previousQuestions = [] } = req.body;

        // Get circle theme
        const pool = getPool();
        const result = await pool.query(
            'SELECT theme FROM circle_sessions WHERE circle_id = $1',
            [id]
        );

        let theme = 'emotional support';
        if (result.rows.length > 0) {
            theme = result.rows[0].theme;
        }

        // Generate question
        const question = await generateEmotionalRouletteQuestion(
            theme,
            trustLevel,
            previousQuestions
        );

        console.log(`🎲 Emotional Roulette for circle ${id}: "${question}"`);

        res.json({
            question,
            trustLevel,
            answerTimeLimit: 60, // seconds
            canPass: true
        });
    } catch (error) {
        console.error('Error generating Emotional Roulette question:', error);
        res.status(500).json({ error: 'Failed to generate question' });
    }
});

export default router;
