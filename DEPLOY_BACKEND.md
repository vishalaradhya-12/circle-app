# 🚀 DEPLOY BACKEND TO RENDER - QUICK GUIDE

## Why Deploy?
- ✅ Get stable URL (no more IP address issues)
- ✅ APK builds will work reliably
- ✅ Voice calls will work
- ✅ Access from anywhere

---

## 📋 Steps to Deploy (15 minutes)

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `circle-backend`
3. Make it **Private**
4. Click "Create repository"

### 2. Push Code to GitHub

```bash
cd /Users/vishalaradhyajc/Desktop/circle-app
git remote add origin https://github.com/YOUR_USERNAME/circle-backend.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your `circle-backend` repository
5. Configure:
   - **Name**: circle-api
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=(Render will provide PostgreSQL)
   REDIS_URL=(Render will provide Redis)
   AGORA_APP_ID=3605bccbfb3546ccae9de1c36dfd4ebd
   ```

7. Click "Create Web Service"

### 4. Get Your URL

After deployment completes (~5 min), you'll get a URL like:
```
https://circle-api.onrender.com
```

### 5. Update Mobile App

Edit `/Users/vishalaradhyajc/Desktop/circle-app/mobile-app/src/services/api.service.ts`:

```typescript
const API_BASE_URL = 'https://circle-api.onrender.com';
```

### 6. Build APK

```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
eas build --profile preview --platform android
```

**THIS WILL WORK!** ✅

---

## 🎯 Alternative: Use Railway (Even Easier)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `circle-backend`
5. Railway auto-detects everything
6. Get URL: `https://circle-backend.up.railway.app`

---

## ⚡ DO THIS NOW

**Option A**: I'll guide you through Render deployment (15 min)
**Option B**: I'll guide you through Railway deployment (10 min)

**Which one?** Tell me A or B and I'll walk you through it step by step!

Once deployed, the APK build will work perfectly with voice calls! 🎉
