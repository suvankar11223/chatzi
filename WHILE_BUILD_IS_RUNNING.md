# While Your Build is Running ⏳

## What's Happening Now?

Your code is being uploaded to Expo's servers and compiled into an Android APK with Agora support. This takes **10-20 minutes**.

## Build Process Steps

1. ✅ **Uploading code** (1-2 min)
2. ⏳ **Installing dependencies** (2-3 min)
3. ⏳ **Compiling native modules** (5-10 min) - This is where Agora gets built
4. ⏳ **Building APK** (2-5 min)
5. ⏳ **Uploading to Expo servers** (1-2 min)

## What You Can Do

### Option 1: Wait and Watch
- Keep the terminal open
- You'll see progress updates
- Build URL will appear when done

### Option 2: Close Terminal and Check Later
```bash
# Check build status anytime
eas build:list

# See detailed logs
eas build:view [BUILD_ID]
```

### Option 3: Do Something Else
- Grab coffee ☕
- Take a break 🚶
- The build runs on Expo's servers, not your computer
- You can even shut down your computer!

## When Build Completes

You'll see something like:

```
✔ Build finished

Build artifact: https://expo.dev/artifacts/eas/[...].apk

Install and run
› Press i to install the app on a connected Android device
› Open the build artifact link in a browser to download
```

## Next Steps After Build

### 1. Download the APK
- Click the artifact link, OR
- Go to https://expo.dev/accounts/[your-account]/projects/chatzi/builds
- Download the APK

### 2. Install on Android Device

**Method A: Direct Download (Easiest)**
- Open the artifact link on your Android device
- Download and install
- Enable "Install from unknown sources" if prompted

**Method B: Transfer from Computer**
- Download APK to computer
- Transfer to phone via USB/email/cloud
- Install on phone

### 3. Run Development Server
```bash
cd frontend
npx expo start --dev-client
```

### 4. Open App and Connect
- Open the "Chatzi (dev)" app on your device
- Scan the QR code from the terminal
- Your app loads with Agora support!

### 5. Test Calls
- Login with two different accounts on two devices
- Open a conversation
- Click the phone 📞 or video 📹 icon
- Make your first call! 🎉

## Troubleshooting

### Build Failed?
```bash
# Check error details
eas build:list

# Try again
eas build --profile development --platform android
```

### Can't Install APK?
- Enable "Install from unknown sources" in Android Settings
- Security → Install unknown apps → Chrome/Browser → Allow

### App Won't Connect?
- Make sure backend is running: `cd backend && npm run dev`
- Check your local IP is correct in network.ts
- Restart the dev server: `npx expo start --dev-client -c`

## Useful Commands

```bash
# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel

# Start new build
eas build --profile development --platform android

# Run dev server
npx expo start --dev-client

# Clear cache and restart
npx expo start --dev-client -c
```

## Expected Timeline

- **Now**: Build started ⏳
- **+5 min**: Dependencies installed
- **+10 min**: Native modules compiled
- **+15 min**: APK built
- **+20 min**: Build complete! ✅

## What to Expect

The build artifact will be a file like:
- `chatzi-[hash].apk`
- Size: ~50-80 MB
- Valid for: 30 days (then rebuild if needed)

## After Installation

Your app will have:
- ✅ Agora voice calling
- ✅ Agora video calling
- ✅ All your existing features
- ✅ Hot reload for code changes
- ✅ No need to rebuild for code changes!

---

## Quick Reference

**Check Status:**
```bash
eas build:list
```

**After Build:**
1. Download APK
2. Install on device
3. Run: `npx expo start --dev-client`
4. Open app and scan QR code
5. Test calls!

---

**Estimated Time Remaining:** 10-20 minutes

Sit back and relax! ☕ The build is running on Expo's servers.
