# Railway Database Setup Guide

## 🚨 Current Issue
Your Railway deployment is failing because it's trying to connect to `localhost:5432` for PostgreSQL, but Railway containers don't have a local database.

**Error:** `ECONNREFUSED ::1:5432` and `ECONNREFUSED 127.0.0.1:5432`

---

## ✅ Solution: Add PostgreSQL to Railway

### Step 1: Add PostgreSQL Database

1. **Go to your Railway project dashboard**
   - URL: https://railway.app/project/[your-project-id]

2. **Click the "New" button** (top right)

3. **Select "Database" → "Add PostgreSQL"**
   - Railway will automatically provision a new PostgreSQL instance
   - This takes about 30-60 seconds

4. **Railway automatically sets environment variables**
   - `DATABASE_URL` will be automatically available to all services in your project
   - You don't need to manually configure anything!

### Step 2: Verify Environment Variables

1. **Click on your backend service** (circle-backend)

2. **Go to the "Variables" tab**

3. **Verify these variables exist:**
   ```
   DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway
   OPENAI_API_KEY=sk-proj-... (if you have one)
   AGORA_APP_ID=3605bccbfb3546ccae9de1c36dfd4ebd
   AGORA_APP_CERTIFICATE=bf70467861fe4b028f324ca9655ed5e4
   PORT=3000
   NODE_ENV=production
   ```

4. **Add any missing variables** from your local `.env` file:
   - `AGORA_APP_ID`
   - `AGORA_APP_CERTIFICATE`
   - `JWT_SECRET` (use a strong random string for production)
   - `OPENAI_API_KEY` (if you have one)

### Step 3: Redeploy

1. **Go to the "Deployments" tab** of your backend service

2. **Click "Redeploy"** on the latest deployment
   - OR make a small code change and push to trigger a new deployment

3. **Monitor the logs** - you should see:
   ```
   ✓ Database tables created/verified
   ✓ Server started on port 3000
   ```

---

## 🔧 Alternative: Use External Database (Optional)

If you prefer to use an external PostgreSQL provider:

### Popular Options:
- **Supabase** (Free tier: 500MB) - https://supabase.com
- **Neon** (Free tier: 3GB) - https://neon.tech
- **ElephantSQL** (Free tier: 20MB) - https://www.elephantsql.com

### Setup Steps:
1. Create a database on your chosen provider
2. Copy the connection string (format: `postgresql://user:password@host:port/database`)
3. In Railway, go to your backend service → Variables tab
4. Add/update `DATABASE_URL` with your connection string
5. Redeploy

---

## 📊 Verify Database Connection

After deployment, check the logs for:

✅ **Success indicators:**
```
✓ Database tables created/verified
Server running on port 3000
```

❌ **Failure indicators:**
```
Database connection failed: AggregateError [ECONNREFUSED]
ECONNREFUSED ::1:5432
```

---

## 🎯 Next Steps After Database Setup

Once your database is connected:

1. **Test the API endpoints:**
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```

2. **Update mobile app API URL:**
   - Edit `mobile-app/src/services/api.service.ts`
   - Change `BASE_URL` to your Railway deployment URL

3. **Test the full flow:**
   - Create a session
   - Join matching queue
   - Start a circle

---

## 🆘 Troubleshooting

### Database connection still failing?

1. **Check DATABASE_URL format:**
   ```
   postgresql://username:password@host:port/database
   ```

2. **Verify database is running:**
   - In Railway dashboard, check PostgreSQL service status
   - Should show "Active" with green indicator

3. **Check firewall/network:**
   - Railway's PostgreSQL should be accessible from Railway services automatically
   - External databases may need to whitelist Railway's IP ranges

### Need help?

Check Railway logs:
```bash
railway logs --service circle-backend
```

Or view in dashboard: Deployments tab → Click on deployment → View Logs
