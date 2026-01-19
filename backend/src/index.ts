import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import sessionRoutes from './routes/session.routes';
import matchingRoutes from './routes/matching.routes';
import circleRoutes from './routes/circle.routes';

// Import services
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { startMidnightCleanup, stopMidnightCleanup } from './services/midnight.service';

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
})); // Security headers
app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // Logging
app.use(express.static('public')); // Serve static files from public directory

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'CIRCLE API'
    });
});

// API Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/circles', circleRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Join session room for matching notifications
    socket.on('join-session', (sessionId: string) => {
        socket.join(sessionId);
        console.log(`📍 Socket ${socket.id} joined session room: ${sessionId}`);

        // Send confirmation
        socket.emit('session-joined', { sessionId });
    });

    // Leave session room
    socket.on('leave-session', (sessionId: string) => {
        socket.leave(sessionId);
        console.log(`📤 Socket ${socket.id} left session room: ${sessionId}`);
    });

    // Join circle room for voice coordination
    socket.on('join-circle', (circleId: string) => {
        socket.join(circleId);
        console.log(`🎭 Socket ${socket.id} joined circle: ${circleId}`);
    });

    // Leave circle room
    socket.on('leave-circle', (circleId: string) => {
        socket.leave(circleId);
        console.log(`👋 Socket ${socket.id} left circle: ${circleId}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Make io available globally
app.set('io', io);

// Initialize services and start server
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        console.log('✓ Database connected');

        // Initialize Redis
        await initializeRedis();
        console.log('✓ Redis connected');

        // Start midnight circle cleanup service
        startMidnightCleanup();
        console.log('✓ Midnight circle cleanup started');

        // Start server
        httpServer.listen(PORT, () => {
            console.log(`\n🎯 CIRCLE API Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    stopMidnightCleanup();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

startServer();

export { io };
