# 🚀 DEPLOY TO RAILWAY - SIMPLE STEPS

## Your GitHub repo is ready at:
https://github.com/vishalaradhya-12/circle-app

---

## ⚡ QUICK DEPLOY (5 minutes)

### Step 1: Push Code to GitHub

The git push might be waiting for authentication. Open a new terminal and run:

```bash
cd /Users/vishalaradhyajc/Desktop/circle-app
git push -u origin main
```

If it asks for credentials, use your GitHub username and **Personal Access Token** (not password).

**Don't have a token?**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`
4. Copy the token and use it as password

---

### Step 2: Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: `vishalaradhya-12/circle-app`
6. **Railway will auto-detect and deploy!**

---

### Step 3: Add Databases

In your Railway project:

1. **Click**: "+ New"
2. **Select**: "Database" → "PostgreSQL"
3. **Click**: "+ New" again
4. **Select**: "Database" → "Redis"

Railway auto-connects them to your backend!

---

### Step 4: Set Environment Variables

1. **Click** on your backend service
2. **Go to**: "Variables" tab
3. **Add**:
   ```
   NODE_ENV=production
   AGORA_APP_ID=3605bccbfb3546ccae9de1c36dfd4ebd
   ```

---

### Step 5: Get Your URL

1. **Click**: "Settings" tab
2. **Click**: "Generate Domain"
3. **Copy** the URL (e.g., `https://circle-app-production.up.railway.app`)

---

### Step 6: Update Mobile App

Edit: `/Users/vishalaradhyajc/Desktop/circle-app/mobile-app/src/services/api.service.ts`

**Change line 6 from:**
```typescript
const API_BASE_URL = 'http://192.168.29.43:3000';
```

**To:**
```typescript
const API_BASE_URL = 'https://YOUR-RAILWAY-URL.up.railway.app';
```

(Replace with your actual Railway URL)

---

### Step 7: Build Final APK

```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
eas build --profile preview --platform android
```

---

## ✅ DONE!

Your backend will be live at a stable URL, and the APK build will work with voice calls!

**Total time**: ~15 minutes
**Cost**: FREE (Railway free tier)

---

## 🆘 Need Help?

If git push fails, just:
1. Go to https://github.com/vishalaradhya-12/circle-app
2. Click "uploading an existing file"
3. Drag the entire `/Users/vishalaradhyajc/Desktop/circle-app/backend` folder
4. Commit
5. Then deploy to Railway

**Start with Step 2 (Railway) and I'll help you!**
