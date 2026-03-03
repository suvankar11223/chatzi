# 📱 Build Guide - Development Client

## ⚠️ IMPORTANT: You Must Be in the Frontend Directory

The error you're seeing happens because you need to run EAS commands from the `frontend` directory.

---

## 🚀 Step-by-Step Build Instructions

### Step 1: Navigate to Frontend Directory

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
```

**Verify you're in the right place:**
```bash
pwd
# Should show: C:\Users\sangh\Downloads\chat-app\frontend
```

### Step 2: Upgrade EAS CLI (Optional but Recommended)

```bash
npm install -g eas-cli
```

### Step 3: Configure EAS Build

```bash
eas build:configure
```

This will:
- Create/update `eas.json` configuration
- Set up build profiles
- Configure for development builds

### Step 4: Build Development Client

```bash
eas build --profile development --platform android
```

This will:
- Build a development client with native modules (expo-av, Firebase, etc.)
- Upload to EAS servers
- Provide a download link when complete

**Build time**: ~10-15 minutes

### Step 5: Install on Device

Once the build completes:
1. You'll get a download link
2. Open the link on your Android device
3. Download and install the APK
4. Allow installation from unknown sources if prompted

### Step 6: Start Development Server

After the development client is installed:

```bash
npx expo start --dev-client
```

Then:
- Press `a` to open on Android device
- Or scan the QR code with the development client app

---

## 🔄 Alternative: Local Build (Faster for Testing)

If you want to build locally instead of using EAS:

### Step 1: Prebuild Native Projects

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo prebuild --clean
```

This creates `android/` and `ios/` folders with native code.

### Step 2: Build and Run on Device

**Make sure your Android device is connected via USB with USB debugging enabled.**

```bash
npx react-native run-android
```

This will:
- Build the app
- Install on connected device
- Start the Metro bundler

---

## 📋 Prerequisites

### For EAS Build:
- ✅ Expo account (create at expo.dev)
- ✅ EAS CLI installed (`npm install -g eas-cli`)
- ✅ Logged in (`eas login`)

### For Local Build:
- ✅ Android Studio installed
- ✅ Android SDK configured
- ✅ Java JDK installed
- ✅ Device connected with USB debugging enabled

---

## 🐛 Troubleshooting

### Error: "package.json is outside of the current git repository"

**Cause**: Running EAS command from wrong directory  
**Solution**: 
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
eas build --profile development --platform android
```

### Error: "eas-cli is outdated"

**Solution**:
```bash
npm install -g eas-cli
```

### Error: "Not logged in"

**Solution**:
```bash
eas login
```

### Error: "No Android SDK found" (Local build)

**Solution**:
1. Install Android Studio
2. Open Android Studio > SDK Manager
3. Install Android SDK Platform 34
4. Set ANDROID_HOME environment variable

### Build Fails with "Out of memory"

**Solution**: Use EAS build instead of local build (EAS has more resources)

---

## 📱 Why Development Client is Required

Your app uses these native modules that don't work in Expo Go:

1. **expo-av** - Audio recording and playback (voice messages)
2. **@react-native-firebase/app** - Firebase core (Google Sign-In)
3. **@react-native-firebase/auth** - Firebase authentication
4. **@react-native-google-signin/google-signin** - Google Sign-In

These require native code compilation, which is why you need a development build.

---

## 🎯 Recommended Approach

**For first-time setup**: Use EAS Build (easier, no local setup needed)

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
eas build:configure
eas build --profile development --platform android
```

**For rapid iteration**: Use local build (faster rebuilds)

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo prebuild --clean
npx react-native run-android
```

---

## ✅ After Build is Installed

1. **Start backend server**:
   ```bash
   cd C:\Users\sangh\Downloads\chat-app\backend
   npm start
   ```

2. **Start frontend development server**:
   ```bash
   cd C:\Users\sangh\Downloads\chat-app\frontend
   npx expo start --dev-client
   ```

3. **Open app on device**:
   - The development client app will be installed on your device
   - Open it and scan the QR code from the terminal
   - Or press `a` in the terminal to open automatically

---

## 🔑 Don't Forget

Before testing features, make sure you've:

1. ✅ Added Cloudinary credentials to `backend/.env`
2. ✅ Downloaded new `google-services.json` from Firebase
3. ✅ Backend server is running
4. ✅ Device is on the same network as your computer

---

## 💡 Quick Commands Reference

```bash
# Navigate to frontend
cd C:\Users\sangh\Downloads\chat-app\frontend

# EAS Build (recommended for first time)
eas build:configure
eas build --profile development --platform android

# Local Build (faster for iteration)
npx expo prebuild --clean
npx react-native run-android

# Start development server
npx expo start --dev-client

# Start backend
cd ../backend
npm start
```

---

## 📞 Need Help?

If you encounter issues:

1. Check you're in the `frontend` directory
2. Verify EAS CLI is installed: `eas --version`
3. Verify you're logged in: `eas whoami`
4. Check the error message carefully
5. Try upgrading EAS CLI: `npm install -g eas-cli`

---

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Build completes without errors
- ✅ APK downloads and installs on device
- ✅ App opens and shows login screen
- ✅ Can connect to backend server
- ✅ Voice recording works
- ✅ Google Sign-In works

Good luck! 🚀
