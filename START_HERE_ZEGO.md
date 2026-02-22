# 🎯 START HERE - ZegoCloud Setup

## ✅ What's Done

Agora has been completely removed and replaced with ZegoCloud. Everything is ready - you just need to add your credentials!

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Packages (2 min)
Double-click: `install-zego.bat`

Or run:
```bash
cd frontend
npx expo install @zegocloud/zego-uikit-prebuilt-call-rn
npx expo install zego-express-engine-reactnative
npx expo install zego-zim-react-native
```

### Step 2: Get Credentials (2 min)
1. Go to: **https://console.zegocloud.com/**
2. Sign up (free, takes 30 seconds)
3. Click "Create Project"
4. Name it "Chatzi" (or anything)
5. Select "UIKit" as product
6. Copy your:
   - **App ID** (a number like `123456789`)
   - **App Sign** (a long string like `abc123def456...`)

### Step 3: Add Credentials (1 min)
Open `frontend/constants/zego.ts` and replace:

```typescript
// BEFORE:
export const ZEGO_APP_ID = 0;
export const ZEGO_APP_SIGN = '';

// AFTER (with your actual values):
export const ZEGO_APP_ID = 123456789;        // Your number
export const ZEGO_APP_SIGN = 'abc123def456...';  // Your string
```

**IMPORTANT:**
- App ID is a NUMBER (no quotes)
- App Sign is a STRING (with quotes)

### Step 4: Start App (1 min)
Double-click: `start-with-zego.bat`

Or run:
```bash
cd frontend
npx expo start --clear
```

**Always use `--clear` flag after installing packages!**

---

## 📱 Test It

1. Open app on 2 devices (or 1 device + emulator)
2. Log in as different users:
   - Device 1: `tini@test.com` / `password123`
   - Device 2: `suvankar@test.com` / `password123`
3. Open a conversation between them
4. Tap the phone icon (voice) or video icon (video)
5. The other device will show an incoming call screen!

---

## ✨ What You Get

✅ **Works in Expo Go** - No custom build needed!  
✅ **Built-in UI** - Professional call screens included  
✅ **Incoming Calls** - With ringtone and accept/reject buttons  
✅ **All Controls** - Mute, speaker, camera flip built-in  
✅ **Reliable** - Works over WiFi and 4G automatically  

---

## 🐛 Issues?

### "Cannot find module @zegocloud..."
- Run `install-zego.bat`
- Restart with `npx expo start --clear`

### "App ID or App Sign not set"
- Check `frontend/constants/zego.ts`
- App ID = number (no quotes)
- App Sign = string (with quotes)
- Restart with `--clear` flag

### Call buttons not showing
- Only works in direct conversations (not groups)
- Check console for "[Zego] Initialized successfully"

---

## 📚 More Info

- `ZEGO_READY_TO_USE.md` - Quick reference
- `ZEGO_SETUP_COMPLETE.md` - Detailed setup
- `COMPLETE_ZEGO_GUIDE.md` - Full documentation

---

## 🎯 That's It!

Just 3 things:
1. Run `install-zego.bat`
2. Add credentials from https://console.zegocloud.com/
3. Run `start-with-zego.bat`

You'll be making calls in 5 minutes! 🚀
