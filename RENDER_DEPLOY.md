# 🚀 Deploy to Render.com (100% FREE)

## Why Render?
- ✅ **Completely FREE** - No credit card needed
- ✅ **Free PostgreSQL** database included
- ✅ **Free Redis** cache included
- ✅ **Auto-deploys** from GitHub
- ✅ **Stable URL** - Never changes
- ✅ **SSL/HTTPS** - Automatic

---

## 📋 Quick Deploy (10 minutes)

### Step 1: Push Latest Code

```bash
cd /Users/vishalaradhyajc/Desktop/circle-app
git add render.yaml
git commit -m "Add Render deployment config"
git push origin main
```

### Step 2: Sign Up on Render

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repos

### Step 3: Create New Blueprint

1. Click **"New +"** → **"Blueprint"**
2. Connect your repository: `vishalaradhya-12/circle-app`
3. Render will detect `render.yaml` automatically
4. Click **"Apply"**

That's it! Render will:
- ✅ Create PostgreSQL database
- ✅ Create Redis cache
- ✅ Build your backend
- ✅ Deploy everything
- ✅ Give you a URL

---

## 🔗 Get Your URL

After deployment (takes ~5 minutes):

1. Click on **"circle-backend"** service
2. Copy the URL (e.g., `https://circle-backend.onrender.com`)
3. Test it:
   ```bash
   curl https://circle-backend.onrender.com/health
   ```

---

## 📱 Update Mobile App

Edit: `mobile-app/src/services/api.service.ts`

**Change line 6:**
```typescript
const API_BASE_URL = 'https://circle-backend.onrender.com';
```

---

## ⚡ Important Notes

### Free Tier Limitations:
- **Spins down after 15 min of inactivity** (first request takes ~30 seconds to wake up)
- **750 hours/month** (more than enough for development)
- **100 GB bandwidth/month**

### Keep It Awake (Optional):
If you want instant responses, use a free uptime monitor:
1. Go to: **https://uptimerobot.com**
2. Add your Render URL
3. It will ping every 5 minutes to keep it awake

---

## 🔧 Environment Variables

Render automatically sets these from `render.yaml`:
- ✅ `NODE_ENV=production`
- ✅ `AGORA_APP_ID=3605bccbfb3546ccae9de1c36dfd4ebd`
- ✅ `DATABASE_URL` (auto from PostgreSQL)
- ✅ `REDIS_URL` (auto from Redis)

**No manual configuration needed!**

---

## 🎯 Alternative: Manual Setup

If Blueprint doesn't work, you can deploy manually:

### 1. Create Web Service
- Click **"New +"** → **"Web Service"**
- Connect GitHub repo: `vishalaradhya-12/circle-app`
- **Root Directory**: `backend`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `node dist/index.js`

### 2. Add Databases
- Click **"New +"** → **"PostgreSQL"**
- Name: `circle-db`
- Click **"New +"** → **"Redis"**
- Name: `circle-redis`

### 3. Connect Databases
- Go to your web service → **"Environment"**
- Add environment variables:
  - `DATABASE_URL` → Link to PostgreSQL
  - `REDIS_URL` → Link to Redis

---

## ✅ Verify Deployment

### Health Check:
```bash
curl https://YOUR-RENDER-URL.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T..."
}
```

### Test Agora Token:
```bash
curl https://YOUR-RENDER-URL.onrender.com/api/agora/token?channelName=test
```

Should return:
```json
{
  "token": "...",
  "uid": "...",
  "channelName": "test"
}
```

---

## 🆘 Troubleshooting

### Build Fails?
**Check build logs** in Render dashboard. Common fixes:
- Make sure `render.yaml` is in repo root
- Verify `backend/package.json` has `build` script
- Check Node version (should be 20.x)

### Database Connection Fails?
- Render auto-injects `DATABASE_URL` and `REDIS_URL`
- Make sure your backend uses these env vars
- Check the "Environment" tab in Render

### Still Issues?
Share the error from Render build logs and I'll help!

---

## 🎉 After Successful Deploy

1. **Copy your Render URL**
2. **Update mobile app** with the URL
3. **Test with Expo Go** - everything should work!
4. **Build final APK** when ready:
   ```bash
   cd mobile-app
   eas build --profile preview --platform android
   ```

---

**Ready to deploy? Run the commands in Step 1! 🚀**
