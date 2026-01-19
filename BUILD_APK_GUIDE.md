# 📱 Building APK for Testing - Step-by-Step Guide

**Date:** January 16, 2026  
**Goal:** Build a testable APK for Android devices

---

## 🎯 **Quick Overview**

We'll build an APK using **EAS Build** (Expo Application Services). This creates a production-quality APK you can install on any Android device.

**Time Required:** 15-30 minutes (mostly waiting for build)

---

## 📋 **Prerequisites**

Before we start, make sure you have:
- ✅ Expo account (free)
- ✅ Node.js installed
- ✅ Internet connection
- ✅ Android device for testing

---

## 🚀 **Step-by-Step Instructions**

### **Step 1: Install EAS CLI**

Open terminal and run:

```bash
npm install -g eas-cli
```

**Expected output:**
```
added 1 package in 5s
```

---

### **Step 2: Login to Expo**

```bash
eas login
```

**What happens:**
- Browser opens
- Login with your Expo account
- Or create a new account (free)

**Expected output:**
```
✔ Logged in as your-email@example.com
```

---

### **Step 3: Navigate to Mobile App**

```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
```

---

### **Step 4: Build the APK**

Run this command:

```bash
eas build --platform android --profile preview
```

**What this does:**
- Uses the "preview" profile (internal distribution)
- Builds an APK (not AAB)
- Can be installed directly on devices

**What you'll see:**

```
✔ Using remote Android credentials (Expo server)
✔ Using Expo project @your-username/circle-app
✔ Compressing project files
✔ Uploading to EAS Build
✔ Queued build
```

**Then:**
```
Build details: https://expo.dev/accounts/your-username/projects/circle-app/builds/...

Waiting for build to complete...
```

---

### **Step 5: Wait for Build to Complete**

**Build time:** 10-20 minutes

**You can:**
- Leave terminal open and wait
- Or close terminal and check status at the URL shown
- You'll get an email when it's done

**Build stages:**
1. ⏳ Queued (1-2 min)
2. ⏳ Building (10-15 min)
3. ✅ Finished

---

### **Step 6: Download the APK**

When build completes, you'll see:

```
✔ Build finished
✔ APK: https://expo.dev/artifacts/eas/...

Download URL: https://expo.dev/artifacts/eas/abc123.apk
```

**Download the APK:**
- Click the URL
- Or run: `eas build:download --platform android`

---

### **Step 7: Install on Android Device**

**Method A: Direct Download (Easiest)**

1. Open the download URL on your Android phone
2. Download the APK
3. Tap to install
4. Allow "Install from unknown sources" if prompted
5. Open CIRCLE app!

**Method B: Transfer via USB**

1. Download APK to computer
2. Connect phone via USB
3. Copy APK to phone
4. Open file manager on phone
5. Tap APK to install

**Method C: Share via Link**

1. Copy the download URL
2. Send to your phone (email, WhatsApp, etc.)
3. Open on phone and download
4. Install

---

## 🧪 **Testing the APK**

### **What to Test:**

1. **App Opens**
   - ✅ Welcome screen loads
   - ✅ No crashes

2. **Onboarding Flow**
   - ✅ Theme selection works
   - ✅ Comfort level works
   - ✅ Availability works

3. **Matching**
   - ✅ Can join queue
   - ✅ Shows "Searching..."
   - ⚠️ Won't match without other users

4. **Voice Calls**
   - ⚠️ Need 2+ devices to test
   - ⚠️ Need backend running

---

## 🔧 **Troubleshooting**

### **Issue: "eas: command not found"**

**Solution:**
```bash
npm install -g eas-cli
```

### **Issue: "Not logged in"**

**Solution:**
```bash
eas login
```

### **Issue: "Build failed"**

**Common causes:**
1. Missing dependencies
2. Syntax errors in code
3. Invalid configuration

**Solution:**
Check build logs at the URL provided

### **Issue: "Can't install APK on phone"**

**Solution:**
1. Enable "Install from unknown sources"
2. Settings → Security → Unknown sources → Enable
3. Try installing again

### **Issue: "App crashes on open"**

**Possible causes:**
1. Backend not running
2. Wrong API URL
3. Missing permissions

**Solution:**
Check logs via `adb logcat` or rebuild with fixes

---

## 📊 **Build Profiles Explained**

### **Preview (What we're using)**
- ✅ APK format (easy to install)
- ✅ Internal distribution
- ✅ Perfect for testing
- ✅ No Google Play needed

### **Development**
- For development builds with hot reload
- Requires Expo Go or dev client
- Not for beta testing

### **Production**
- AAB format (for Google Play)
- Requires signing keys
- For public release

---

## 🎯 **Next Steps After Building**

### **1. Test Locally (You + 1 Friend)**

**Setup:**
1. Start backend: `cd backend && npm run dev`
2. Install APK on 2 phones
3. Both join at same time
4. Test matching and voice

**What to verify:**
- ✅ Both can create sessions
- ✅ Matching works
- ✅ Voice calls connect
- ✅ Emotional Roulette appears
- ✅ Safety report works

### **2. Share with Beta Testers**

**How to share:**
1. Upload APK to Google Drive
2. Create shareable link
3. Send to testers with instructions
4. Collect feedback

**Instructions for testers:**
```
1. Download APK from link
2. Install on Android phone
3. Open CIRCLE app
4. Complete onboarding
5. Join a circle!

Note: You need 3-4 people online at the same time to match.
```

### **3. Iterate Based on Feedback**

**Common feedback:**
- UI improvements
- Bug fixes
- Feature requests

**How to update:**
1. Make changes to code
2. Run `eas build` again
3. Share new APK

---

## 💡 **Pro Tips**

### **Tip 1: Build Multiple Versions**

```bash
# Preview (for testing)
eas build --platform android --profile preview

# Production (for release)
eas build --platform android --profile production
```

### **Tip 2: Check Build Status**

```bash
eas build:list
```

### **Tip 3: Download Previous Builds**

```bash
eas build:download --platform android
```

### **Tip 4: Build for iOS Too**

```bash
eas build --platform ios --profile preview
```

**Note:** Requires Apple Developer account ($99/year)

---

## 📱 **Alternative: Quick Testing with Expo Go**

**If you just want to test quickly:**

```bash
cd mobile-app
npx expo start
```

**Then:**
1. Install "Expo Go" app on phone
2. Scan QR code
3. App loads instantly!

**Pros:**
- ✅ Instant (no build time)
- ✅ Hot reload
- ✅ Free

**Cons:**
- ⚠️ Requires Expo Go app
- ⚠️ Some features may not work
- ⚠️ Not for beta distribution

---

## 🎉 **Summary**

**To build APK:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Navigate to project
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app

# 4. Build
eas build --platform android --profile preview

# 5. Wait 10-20 minutes

# 6. Download and install!
```

**That's it!** 🚀

---

## 🆘 **Need Help?**

**If you get stuck:**

1. Check build logs at the URL provided
2. Google the error message
3. Ask in Expo Discord: https://chat.expo.dev
4. Check Expo docs: https://docs.expo.dev/build/setup/

---

**Ready to build? Let's do it!** 💜

Run this command:
```bash
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app && eas build --platform android --profile preview
```
