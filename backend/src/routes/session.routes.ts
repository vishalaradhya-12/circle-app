import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';
import { UserSession, EmotionalTheme, ComfortLevel } from '../models/types';

const router = Router();

// In-memory session storage for development (when database is not available)
const sessionStore = new Map<string, UserSession>();

/**
 * POST /api/sessions/create
 * Create a new anonymous user session
 */
router.post('/create', async (req: Request, res: Response) => {
    try {
        const {
            emotionalTheme,
            emotionalIntensity,
            comfortLevel,
            timezone,
            preferredDuration
        } = req.body;

        // Validation
        if (!emotionalTheme || !emotionalIntensity || !comfortLevel || !timezone || !preferredDuration) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['emotionalTheme', 'emotionalIntensity', 'comfortLevel', 'timezone', 'preferredDuration']
            });
        }

        if (emotionalIntensity < 1 || emotionalIntensity > 10) {
            return res.status(400).json({
                error: 'emotionalIntensity must be between 1 and 10'
            });
        }

        if (![20, 30].includes(preferredDuration)) {
            return res.status(400).json({
                error: 'preferredDuration must be 20 or 30 minutes'
            });
        }

        // Create session
        const sessionId = uuidv4();
        const createdAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        const session: UserSession = {
            sessionId,
            emotionalTheme,
            emotionalIntensity,
            comfortLevel,
            timezone,
            preferredDuration,
            createdAt,
            expiresAt
        };

        // Try to save to database if available, otherwise use in-memory storage
        try {
            const pool = getPool();
            await pool.query(
                `INSERT INTO user_sessions 
           (session_id, emotional_theme, emotional_intensity, comfort_level, timezone, preferred_duration, created_at, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [sessionId, emotionalTheme, emotionalIntensity, comfortLevel, timezone, preferredDuration, createdAt, expiresAt]
            );
            console.log('✓ Session saved to database:', sessionId);
        } catch (dbError) {
            // Database not available, use in-memory storage
            sessionStore.set(sessionId, session);
            console.log('✓ Session saved to memory:', sessionId);
        }

        // Generate JWT token
        const token = jwt.sign(
            { sessionId, emotionalTheme },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            session,
            token,
            message: 'Session created successfully'
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

/**
 * GET /api/session/:id
 * Get session details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pool = getPool();
        const result = await pool.query(
            'SELECT * FROM user_sessions WHERE session_id = $1 AND expires_at > NOW()',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found or expired' });
        }

        const row = result.rows[0];
        const session: UserSession = {
            sessionId: row.session_id,
            emotionalTheme: row.emotional_theme,
            emotionalIntensity: row.emotional_intensity,
            comfortLevel: row.comfort_level,
            timezone: row.timezone,
            preferredDuration: row.preferred_duration,
            createdAt: row.created_at,
            expiresAt: row.expires_at
        };

        res.json({ session });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

/**
 * DELETE /api/session/:id
 * Delete a session (logout)
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pool = getPool();
        await pool.query('DELETE FROM user_sessions WHERE session_id = $1', [id]);

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

export default router;
