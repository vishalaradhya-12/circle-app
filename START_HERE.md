# ✅ CIRCLE App - Ready to Test!

## 🎉 Setup Status: COMPLETE

Your CIRCLE app is **ready for testing**! Here's what's been configured:

### ✅ What's Done

- ✅ **Redis installed and running**
- ✅ **PostgreSQL database created** (`circle_db`)
- ✅ **Backend environment configured**
- ✅ **Mobile app environment configured**
- ✅ **All dependencies installed**
- ✅ **Native build exists** (iOS/Android folders ready)
- ✅ **Local IP configured**: `192.168.29.43`

### ⚠️ What You Need to Do

**ONLY ONE THING LEFT:** Get Agora credentials for voice calls

---

## 🔑 Get Agora Credentials (5 minutes)

### Step 1: Sign Up
1. Go to: **https://www.agora.io**
2. Click **"Sign Up"** (it's FREE - 10,000 minutes/month)
3. Verify your email

### Step 2: Create Project
1. Log in to: **https://console.agora.io**
2. Click **"Project Management"** → **"Create"**
3. Settings:
   - **Name:** `CIRCLE-Dev`
   - **Use Case:** `Audio Calling`
   - **Authentication:** `APP ID + Token`
4. Click **"Submit"**

### Step 3: Copy Credentials
You'll see two values:
- **App ID** (looks like: `abc123def456...`)
- **App Certificate** (click eye icon to reveal)

### Step 4: Update Config Files

**Edit `backend/.env`:**
```bash
# Find these lines and replace with your actual values:
AGORA_APP_ID=paste-your-app-id-here
AGORA_APP_CERTIFICATE=paste-your-certificate-here
```

**Edit `mobile-app/.env`:**
```bash
# Find this line and replace with your actual App ID:
AGORA_APP_ID=paste-your-app-id-here
```

**IMPORTANT:** Use the **same App ID** in both files!

---

## 🚀 Start Testing (3 Commands)

### Terminal 1: Start Backend
```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/backend
npm run dev
```

**Expected output:**
```
✓ Database connected
✓ Redis connected
🎯 CIRCLE API Server running on port 3000
```

**Keep this running!**

### Terminal 2: Start Mobile App (iOS)
```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
npx expo run:ios
```

**This will:**
- Build the app (5-10 min first time)
- Launch iOS Simulator
- Install and run CIRCLE app

### Terminal 2 Alternative: Android
```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
npx expo run:android
```

---

## 🧪 Test the App

### Single Device Test (UI Only)
1. ✅ Complete onboarding flow
2. ✅ Select theme, comfort level, availability
3. ✅ Enter matching queue
4. ✅ See beautiful animations
5. ⚠️ Will stay in queue (need 2+ users for matching)

### Multi-Device Test (Full Voice)
**Need 2-4 devices/simulators!**

1. Run app on multiple devices
2. Complete onboarding on each
3. Enter matching queue
4. Backend will match you automatically
5. Join voice circle
6. **Test voice calls!** 🎙️

---

## 📱 Testing Options

### Option A: iOS Simulator (Easiest)
```bash
cd mobile-app
npx expo run:ios
```
- ✅ No Apple Developer account needed
- ✅ Fast iteration
- ⚠️ Can't test on real device

### Option B: Physical iPhone
1. Open `mobile-app/ios/circleapp.xcworkspace` in Xcode
2. Connect your iPhone
3. Select your device
4. Click Run (▶️)
- ✅ Real device testing
- ⚠️ Needs Apple Developer account (free tier OK)

### Option C: Android Device/Emulator
```bash
cd mobile-app
npx expo run:android
```
- ✅ Works on emulator or real device
- ✅ No developer account needed

---

## 🐛 Quick Troubleshooting

### "Cannot connect to backend"
```bash
# Check backend is running:
curl http://localhost:3000/health

# Should return: {"status":"healthy",...}
```

### "Agora initialization failed"
- ✅ Check you added Agora credentials to BOTH files
- ✅ Verify App ID matches in backend and mobile
- ✅ Make sure you're using dev build (not Expo Go)

### "Build failed"
```bash
cd mobile-app
rm -rf ios android
npx expo prebuild --clean
```

### "Port 3000 in use"
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📊 Verify Everything Works

### Backend Checklist
- [ ] Server starts without errors
- [ ] `curl http://localhost:3000/health` returns 200
- [ ] See "Client connected" when app opens
- [ ] See "Socket joined session" when entering queue

### Mobile App Checklist
- [ ] App builds and launches
- [ ] All screens load smoothly
- [ ] Animations are beautiful
- [ ] Can complete onboarding
- [ ] Enters matching queue

### Voice Checklist (Need 2+ Devices)
- [ ] Matching creates a circle
- [ ] Voice channel connects
- [ ] Can hear other participants
- [ ] Mute/unmute works
- [ ] Participant list updates
- [ ] Session summary appears

---

## 🎯 Quick Commands

```bash
# Run setup check
./quick-start.sh

# Start backend
cd backend && npm run dev

# Run iOS
cd mobile-app && npx expo run:ios

# Run Android
cd mobile-app && npx expo run:android

# Check backend health
curl http://localhost:3000/health

# Clean rebuild
cd mobile-app && rm -rf ios android && npx expo prebuild --clean
```

---

## 📚 Documentation

- **Main Overview:** `README.md` - Project architecture and features
- **Backend API:** `backend/README.md` - Backend-specific documentation
- **Mobile App:** `mobile-app/README.md` - Mobile app documentation

---

## 🎉 You're Ready!

**Everything is set up!** Just add your Agora credentials and start testing.

### The Flow:
1. ✅ Get Agora credentials (5 min)
2. ✅ Update config files
3. ✅ Start backend
4. ✅ Start mobile app
5. ✅ Test the beautiful app you built! 💜

---

**Good luck! Your mental health app is about to come alive! 🚀**
