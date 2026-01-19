# CIRCLE Backend API

Backend service for CIRCLE - Real Talk. Real People.

## Overview

This is the Node.js/Express backend API that powers the CIRCLE mobile application. It handles:

- Anonymous user session management
- AI-powered matching of users into circles
- Voice room coordination
- Real-time moderation and safety
- Post-session summaries

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.io
- **AI**: OpenAI GPT-4
- **Voice**: Daily.co (or Agora.io)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- OpenAI API key
- Daily.co API key (optional for MVP)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/circle_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-api-key
DAILY_API_KEY=your-daily-api-key (optional)
```

## Database Setup

```bash
# Create PostgreSQL database
createdb circle_db

# Tables will be created automatically on first run
npm run dev
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## API Endpoints

### Session Management

- `POST /api/session/create` - Create anonymous session
- `GET /api/session/:id` - Get session details
- `DELETE /api/session/:id` - Delete session

### Matching

- `POST /api/matching/join` - Join matching queue
- `DELETE /api/matching/leave` - Leave queue
- `GET /api/matching/status/:sessionId` - Check status

### Circle

- `POST /api/circle/join` - Join matched circle
- `POST /api/circle/leave` - Leave circle
- `GET /api/circle/:id/token` - Get voice room token
- `POST /api/circle/:id/report` - Report safety issue
- `GET /api/circle/:id/summary` - Get session summary

### Health

- `GET /health` - Health check

## Architecture

```
src/
├── index.ts              # Main server file
├── config/
│   ├── database.ts       # PostgreSQL configuration
│   └── redis.ts          # Redis configuration
├── models/
│   └── types.ts          # TypeScript type definitions
├── routes/
│   ├── session.routes.ts # Session endpoints
│   ├── matching.routes.ts# Matching endpoints
│   └── circle.routes.ts  # Circle endpoints
├── services/
│   ├── ai.service.ts     # OpenAI integration
│   ├── matching.service.ts# Matching algorithm
│   └── voice.service.ts  # Voice room management
├── middleware/
│   └── auth.ts           # JWT authentication
└── utils/
    └── helpers.ts        # Utility functions
```

## Matching Algorithm

The matching service groups users based on:

1. **Emotional Theme** (required match)
2. **Emotional Intensity** (within 3 points)
3. **Comfort Level** (compatible levels)
4. **Timezone** (for future scheduling)

Matching runs every 30 seconds and creates circles of 3-4 people.

## AI Integration

### OpenAI GPT-4 is used for:

1. **Post-session summaries** - Validation-focused messages
2. **Content moderation** - Safety checks
3. **Conversation prompts** - Gentle facilitation
4. **Sentiment analysis** - Mood tracking

### Privacy Guarantees:

- No audio is stored
- Transcripts are temporary
- Summaries are anonymized
- Data expires automatically

## Safety Features

1. **Real-time moderation** - AI monitors for toxicity
2. **Immediate exit** - Users can leave anytime
3. **Safety reports** - Flag inappropriate behavior
4. **Auto-termination** - AI can end unsafe sessions

## Data Retention

- **Sessions**: 24 hours
- **Summaries**: 7 days
- **Audio**: Never stored
- **Transcripts**: Deleted after moderation

## Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 2: AWS/Heroku

```bash
# Build
npm run build

# Deploy dist/ folder
```

## Monitoring

- **Errors**: Logged to console (add Sentry in production)
- **Performance**: Monitor with custom dashboard
- **Uptime**: Use UptimeRobot or similar

## Security

- Helmet.js for security headers
- Rate limiting on all endpoints
- CORS restrictions
- Input validation
- SQL injection prevention
- Encrypted voice streams

## Testing

```bash
# Run tests (to be implemented)
npm test
```

## License

MIT

## Support

For issues or questions, contact the development team.

---

**Built with empathy. Designed for vulnerability. Prioritizing safety over growth.**
