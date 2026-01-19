# 🔄 COMPLETE RESTART GUIDE - DO THIS YOURSELF

**Follow these steps EXACTLY. Don't skip anything.**

---

## 🛑 **STEP 1: KILL EVERYTHING**

### **Close All Terminals:**
1. Look for any terminal windows
2. Press `Ctrl+C` in each one
3. Close all terminal windows

### **Or Kill Processes:**
```bash
# Open a NEW terminal and run:
killall node
killall expo
```

---

## 🗂️ **STEP 2: OPEN NEW TERMINAL**

1. Open **Terminal** app (or iTerm)
2. Navigate to project:
   ```bash
   cd /Users/vishalaradhyajc/Desktop/circle-app
   ```

---

## 🔧 **STEP 3: START BACKEND**

### **In Terminal 1:**

```bash
# Go to backend
cd /Users/vishalaradhyajc/Desktop/circle-app/backend

# Start server
npm run dev
```

**Wait for this message:**
```
🎯 CIRCLE API Server running on port 3000
```

**✅ When you see that, backend is ready!**

---

## 📱 **STEP 4: START MOBILE (NEW TERMINAL)**

### **Open a NEW terminal (Terminal 2):**

```bash
# Go to mobile app
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app

# Start Expo
npx expo start
```

**Wait for QR code to appear.**

---

## 🎯 **STEP 5: SWITCH TO EXPO GO MODE**

### **In Terminal 2 (where Expo is running):**

**Press the `s` key** (just press 's' and Enter)

**You should see:**
```
› Using Expo Go
```

---

## 📲 **STEP 6: INSTALL EXPO GO ON PHONE**

1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install it
4. Open Expo Go app

---

## 🔗 **STEP 7: CONNECT TO APP**

### **In Expo Go app on your phone:**

1. Tap **"Enter URL manually"** (or "Connection" tab)
2. Type this EXACTLY:
   ```
   exp://192.168.29.43:8081
   ```
3. Tap **"Connect"**

**OR**

1. Tap **"Scan QR code"**
2. Point camera at the QR code in Terminal 2
3. Wait for app to load

---

## ✅ **VERIFICATION CHECKLIST**

Before trying to connect:

- [ ] Backend terminal shows: "Server running on port 3000"
- [ ] Mobile terminal shows: "Using Expo Go"
- [ ] Phone is on **same WiFi** as computer
- [ ] Expo Go app is installed on phone
- [ ] You typed the URL correctly: `exp://192.168.29.43:8081`

---

## 🆘 **IF IT STILL DOESN'T WORK**

### **Check WiFi:**
- Phone WiFi name: ____________
- Computer WiFi name: ____________
- **MUST BE THE SAME!**

### **Check IP Address:**

Run this on your Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for something like `192.168.29.43`

If it's different, use that IP instead!

---

## 🎯 **EXPECTED RESULT**

When you connect in Expo Go:
1. App starts loading
2. You see CIRCLE welcome screen
3. You can complete onboarding
4. You can try to join a circle

---

## 📝 **NOTES**

- **Backend MUST be running** for app to work
- **Phone MUST be on same WiFi** as computer
- **Use `exp://` not `http://`** in Expo Go
- **IP address is `192.168.29.43`** (unless it changed)

---

## 🔥 **QUICK COMMANDS SUMMARY**

```bash
# Terminal 1 - Backend
cd /Users/vishalaradhyajc/Desktop/circle-app/backend
npm run dev

# Terminal 2 - Mobile
cd /Users/vishalaradhyajc/Desktop/circle-app/mobile-app
npx expo start
# Then press 's' to switch to Expo Go

# In Expo Go app on phone:
# Enter URL: exp://192.168.29.43:8081
```

---

**DO THESE STEPS YOURSELF AND TELL ME WHAT HAPPENS AT EACH STEP!** 🚀

**Which step are you stuck on?**
