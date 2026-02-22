# Quick Build Guide - Get Agora Working in 3 Steps!

## Prerequisites (One-time setup)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Create Expo Account (if you don't have one)
- Go to https://expo.dev/signup
- Sign up (it's free!)
- Remember your credentials

### 3. Login to EAS
```bash
eas login
```
Enter your Expo credentials.

## Build Your App (3 Commands)

### Step 1: Configure EAS
```bash
cd frontend
eas build:configure
```
- Choose: **Android**
- Press Enter to accept defaults

### Step 2: Start Build
```bash
eas build --profile development --platform android
```
- This uploads your code and builds the APK
- Takes 10-20 minutes (grab a coffee! ☕)
- You'll get a download link when done

### Step 3: Install & Run
1. **Download APK** from the link EAS provides
2. **Install on your Android device** (enable "Install from unknown sources")
3. **Run dev server:**
   ```bash
   npx expo start --dev-client
   ```
4. **Open the development build app** on your device
5. **Scan the QR code**

## That's It!

Your app now has Agora support and can make voice/video calls! 🎉

## Quick Commands Reference

```bash
# Check if logged in
eas whoami

# Check build status
eas build:list

# Start dev server
npx expo start --dev-client

# Rebuild (if you add new native modules)
eas build --profile development --platform android
```

## Tips

- **First build**: 10-20 minutes
- **Subsequent builds**: 5-10 minutes  
- **Free tier**: 30 builds/month
- **Code changes**: Hot reload without rebuilding!
- **Only rebuild when**: Adding new native modules

## Troubleshooting

**"Not logged in"**
```bash
eas login
```

**"Build failed"**
- Check you're in `frontend` folder
- Run `eas build:list` to see error details

**"Can't install APK"**
- Enable "Install from unknown sources" in Android settings
- Download directly to device instead of computer

---

## Alternative: Use the Batch File

Just double-click `build-dev-client.bat` and follow the prompts!

---

Ready? Start with Step 1! 🚀
