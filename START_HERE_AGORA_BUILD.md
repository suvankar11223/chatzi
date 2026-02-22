# 🚀 Start Here - Build Your App with Agora

## What You Need to Do

Your app is ready, but Agora needs native code that Expo Go can't run. You need to build a custom development client.

## Quick Start (3 Steps)

### 1️⃣ Install & Login (One-time, 2 minutes)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login (create account at expo.dev/signup if needed)
eas login
```

### 2️⃣ Build (10-20 minutes)

```bash
cd frontend

# Configure
eas build:configure
# Choose: Android, press Enter

# Build
eas build --profile development --platform android
# Wait for build to complete (10-20 min)
```

### 3️⃣ Install & Test (2 minutes)

1. Download APK from the link EAS gives you
2. Install on your Android device
3. Run: `npx expo start --dev-client`
4. Open the dev build app and scan QR code
5. Test calls! 📞📹

## What's Already Done ✅

- ✅ Agora SDK installed
- ✅ Agora App ID configured
- ✅ Call screens created
- ✅ Backend ready
- ✅ app.json configured with permissions
- ✅ Everything coded and ready!

## What You're Doing Now

Building a custom app that includes Agora's native code. Think of it as:
- **Expo Go** = Generic app that runs any Expo project
- **Development Build** = Your custom app with Agora built-in

## After Building

- ✅ Code changes hot-reload (no rebuild needed!)
- ✅ Only rebuild when adding NEW native modules
- ✅ Works exactly like Expo Go, but with Agora
- ✅ Free tier: 30 builds/month

## Files Created for You

- `BUILD_WITH_AGORA.md` - Detailed guide
- `QUICK_BUILD_GUIDE.md` - Quick reference
- `build-dev-client.bat` - Automated script
- `app.json` - Updated with permissions

## Commands Cheat Sheet

```bash
# One-time setup
npm install -g eas-cli
eas login

# Build
cd frontend
eas build:configure
eas build --profile development --platform android

# Run after build
npx expo start --dev-client

# Check status
eas whoami
eas build:list
```

## Need Help?

Check these files:
1. `QUICK_BUILD_GUIDE.md` - Step-by-step with troubleshooting
2. `BUILD_WITH_AGORA.md` - Detailed explanation
3. Or just run `build-dev-client.bat`

---

## Ready to Start?

Run these 3 commands:

```bash
npm install -g eas-cli
eas login
cd frontend && eas build:configure && eas build --profile development --platform android
```

Then grab a coffee while it builds! ☕

The build will give you a download link when done. Install it and you're ready to make calls! 🎉
