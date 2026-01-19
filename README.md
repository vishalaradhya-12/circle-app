# CIRCLE - Real Talk. Real People.

<div align="center">

🫂 **A mobile application designed to reduce loneliness through small, safe, voice-based group conversations.**

[![React Native](https://img.shields.io/badge/React_Native-0.81-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Overview

CIRCLE is a mobile-only application that helps people reduce loneliness through short, guided, audio-only sessions with 3–4 other people who share a similar emotional state or life experience.

The product is intentionally **minimal, calm, and emotionally respectful**. It avoids noise, addiction loops, and social pressure.

### Core Principles

- 🎙️ **Voice-only** - No video, no text, just authentic conversation
- 🔒 **Anonymous** - No names, photos, or personal information
- 👥 **Small groups** - 3-4 people maximum
- ⏱️ **Time-bound** - 20-30 minute sessions
- 🤖 **AI-assisted** - For matching, moderation, and safety only
- 💜 **Emotionally safe** - Designed for vulnerability

---

## 🏗️ Project Structure

```
circle-app/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── config/         # Database & Redis
│   │   └── index.ts        # Main server
│   ├── package.json
│   └── tsconfig.json
│
├── mobile-app/             # React Native app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # Reusable components
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API client
│   │   ├── constants/      # Theme & design system
│   │   └── types/          # TypeScript types
│   ├── App.tsx
│   └── package.json
│
├── PROJECT_ARCHITECTURE.md  # Technical architecture
├── IMPLEMENTATION_PLAN.md   # Development roadmap
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Redis** 6+
- **Expo CLI** (for mobile development)
- **OpenAI API key**
- **Daily.co API key** (optional for MVP)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Mobile App Setup

```bash
# Navigate to mobile app
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 🎨 Design Philosophy

### Visual Design

- **Calm color palette** - Soft purples, lavenders, and pinks
- **Generous spacing** - Breathable layouts
- **Subtle animations** - Slow, natural transitions
- **Clean typography** - Clear, accessible text

### Interaction Design

- **No social media patterns** - No likes, followers, or feeds
- **No gamification** - No badges, streaks, or points
- **No pressure** - Users can leave anytime
- **One-hand usage** - Accessible touch targets

### Emotional Design

The app should feel:
- ✨ **Calm** - Not overwhelming
- 🤗 **Warm** - Welcoming and safe
- 🛡️ **Safe** - Protected and private
- 🕊️ **Unhurried** - No rush or pressure
- 🙏 **Respectful** - Honoring vulnerability

---

## 🔧 Technology Stack

### Mobile App
- **React Native** with Expo
- **TypeScript**
- **React Navigation** for routing
- **Axios** for API calls
- **AsyncStorage** for local data
- **Expo AV** for voice

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **PostgreSQL** for data
- **Redis** for caching
- **Socket.io** for real-time
- **OpenAI GPT-4** for AI features

### Infrastructure
- **AWS** / **Railway** for hosting
- **Daily.co** / **Agora.io** for voice
- **Sentry** for monitoring

---

## 📱 Features

### ✅ Implemented (MVP)

- [x] Anonymous session creation
- [x] Emotional theme selection
- [x] Comfort level selection
- [x] AI-powered matching
- [x] Voice room integration (placeholder)
- [x] Post-session summaries
- [x] Safety reporting
- [x] Real-time moderation (AI)

### 🔄 In Progress

- [ ] Complete onboarding flow
- [ ] Voice circle interface
- [ ] WebSocket integration
- [ ] Full matching system

### 📋 Planned (Phase 2)

- [ ] Advanced sentiment analysis
- [ ] Recurring circles
- [ ] Private emotional tracking
- [ ] Session quality scoring

### 🌟 Future (Phase 3)

- [ ] Theme journeys
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Community features

---

## 🤖 AI Integration

AI is used **strictly as a facilitator**, never as a participant:

1. **Matching** - Groups users by emotional compatibility
2. **Moderation** - Detects toxicity and unsafe content
3. **Prompts** - Gentle conversation starters during silence
4. **Summaries** - Validation-focused post-session messages

### AI Boundaries

AI must **NEVER**:
- Act as a conversational participant
- Give therapy or diagnosis
- Create emotional dependency
- Replace human empathy

---

## 🔒 Privacy & Safety

### Privacy Guarantees

- ✅ No permanent audio storage
- ✅ No identity linking
- ✅ No data resale
- ✅ Sessions expire after 24 hours
- ✅ Summaries expire after 7 days

### Safety Features

- 🚨 Real-time toxicity detection
- 🚪 Immediate exit button
- 📢 Safety reporting system
- ⛔ Auto-termination for unsafe sessions
- 🛡️ AI moderation layer

---

## 📊 Success Metrics

We measure **meaningful engagement**, not vanity metrics:

### ✅ Good Metrics
- Session completion rate
- Repeat participation
- Speaking balance
- Sentiment improvement
- User-reported relief

### ❌ Avoid
- Daily active users (creates pressure)
- Session count (encourages addiction)
- Engagement time (not the goal)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Mobile app tests
cd mobile-app
npm test
```

---

## 🚢 Deployment

### Backend Deployment

```bash
# Build
npm run build

# Deploy to Railway
railway up

# Or deploy to AWS
# (See backend/README.md for details)
```

### Mobile App Deployment

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

---

## 📚 Documentation

- [Technical Architecture](PROJECT_ARCHITECTURE.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Backend README](backend/README.md)
- [API Documentation](backend/API.md) *(coming soon)*

---

## 🤝 Contributing

This is currently a private project. If you'd like to contribute, please reach out to the development team.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 💬 Support

For questions or issues:
- 📧 Email: support@circle-app.com *(placeholder)*
- 🐛 Issues: GitHub Issues
- 📖 Docs: See documentation above

---

## 🙏 Acknowledgments

Built with empathy for people experiencing:
- Loneliness
- Work stress
- Breakups
- Anxiety
- Feeling stuck
- Grief
- Overwhelm

**You are not alone.** 💜

---

<div align="center">

**CIRCLE - Real Talk. Real People.**

*Depth over scale. Safety over virality. Humans over algorithms.*

</div>
