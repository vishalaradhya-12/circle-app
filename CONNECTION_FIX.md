# 🔧 CONNECTION FIX GUIDE

## ✅ Current Status (Verified)
- ✓ Backend is running on port 3000
- ✓ IP Address: `192.168.29.43`
- ✓ Backend health check works: `http://192.168.29.43:3000/health`
- ✓ Mobile app is configured with correct IP

## 🚨 THE PROBLEM

You're getting "could not connect to server" because you're likely using an **OLD APK** that has a **hardcoded wrong IP address** or **localhost**.

## 🎯 THE SOLUTION

You have **3 options**:

---

### **OPTION 1: Use Expo Go (EASIEST - No Voice Calls)**

This bypasses the old APK completely.

#### Steps:
1. **Install Expo Go** from Google Play Store
2. **Open Expo Go** app
3. **Tap "Enter URL manually"**
4. **Type exactly**: `exp://192.168.29.43:8081`
5. **Tap Connect**

**✅ This will work immediately** because it loads fresh code from your computer.

**⚠️ Limitation**: Voice calls won't work (Agora needs native build)

---

### **OPTION 2: Build New APK (BEST - Full Features)**

Build a fresh APK with the correct IP address.

#### Steps:
1. Make sure both backend and mobile app are running
2. In a new terminal, run:
   ```bash
   cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
   eas build --profile preview --platform android
   ```
3. Wait for build to complete (~10-15 minutes)
4. Download and install the new APK on your phone
5. Open the app

**✅ This gives you full features** including voice calls.

---

### **OPTION 3: Test on Android Emulator (TESTING)**

Test on your computer first.

#### Steps:
1. Make sure Android Studio emulator is running
2. In the Expo terminal, press `a` to open Android
3. The app will open in the emulator
4. Test the connection there

---

## 🔍 VERIFY YOUR PHONE'S WIFI

**Your phone MUST be on the same WiFi as your computer!**

### Check on Phone:
1. Open **Settings** → **WiFi**
2. Check the WiFi name

### Check on Computer:
```bash
# Run this to see your WiFi name
networksetup -getairportnetwork en0
```

**They MUST match!**

---

## 🧪 TEST THE CONNECTION FROM YOUR PHONE

### Method 1: Use Phone Browser
1. Open **Chrome** or any browser on your phone
2. Go to: `http://192.168.29.43:3000/health`
3. You should see: `{"status":"healthy",...}`

**If this doesn't work**, your phone can't reach your computer (WiFi/Firewall issue).

### Method 2: Ping Test
1. Download **Network Analyzer** app from Play Store
2. Try to ping `192.168.29.43`
3. Should get responses

---

## 🔥 FIREWALL FIX (If browser test fails)

Your Mac might be blocking connections.

### Allow Node through Firewall:
1. Open **System Settings** → **Network** → **Firewall**
2. Click **Options**
3. Find **node** in the list
4. Set to **Allow incoming connections**
5. Click **OK**

OR turn off firewall temporarily:
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

To turn back on:
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

---

## 📱 RECOMMENDED: Use Expo Go Right Now

Since you want to check the app quickly:

1. **Install Expo Go** from Play Store
2. **Open Expo Go**
3. **Enter URL**: `exp://192.168.29.43:8081`
4. **Done!** ✅

This will work immediately and let you test the UI, navigation, and onboarding flow.

---

## ❓ Which option do you want to try?

Tell me and I'll help you through it step by step!
