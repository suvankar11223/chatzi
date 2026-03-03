# Fix: Cannot find native module 'ExpoCrypto'

## Problem
The error `Cannot find native module 'ExpoCrypto'` occurs because:
- `expo-crypto` is a native module required by Clerk
- Native modules must be included in your development build
- Your current development build doesn't include this module

## Solution

You need to rebuild your development build to include the native module.

### Option 1: Rebuild Development Build (Recommended)

1. **Stop the current dev server** (Ctrl+C in terminal)

2. **Clear cache and rebuild**:
   ```bash
   cd frontend
   npx expo prebuild --clean
   ```

3. **Build a new development build**:
   
   For Android:
   ```bash
   npx expo run:android
   ```
   
   For iOS:
   ```bash
   npx expo run:ios
   ```

4. **Wait for build to complete** (this may take 5-10 minutes)

5. **Start the dev server**:
   ```bash
   npx expo start --dev-client
   ```

### Option 2: Use EAS Build (Cloud Build)

If local build fails, use EAS Build:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Build development client**:
   ```bash
   cd frontend
   eas build --profile development --platform android
   ```

4. **Download and install the APK** when build completes

5. **Start dev server**:
   ```bash
   npx expo start --dev-client
   ```

### Option 3: Quick Fix - Use Expo Go (Limited)

⚠️ **Note**: Expo Go doesn't support Clerk, so authentication won't work!

This is only for testing non-auth features:

```bash
cd frontend
npx expo start
```

Then scan QR code with Expo Go app.

## Why This Happens

- Clerk requires `expo-crypto` for secure authentication
- `expo-crypto` is a native module (requires native code)
- Native modules must be compiled into the app
- Expo Go doesn't include all native modules
- You need a custom development build

## What's a Development Build?

A development build is like Expo Go, but customized for your app:
- Includes all your native modules
- Supports hot reload
- Allows debugging
- Required for Clerk and other native modules

## Verification

After rebuilding, you should see:
- ✅ No "Cannot find native module" errors
- ✅ Clerk authentication works
- ✅ Login/register screens load
- ✅ App runs smoothly

## Troubleshooting

### Build fails with "Android SDK not found"
Install Android Studio and set up Android SDK:
- Download Android Studio
- Open Android Studio > SDK Manager
- Install Android SDK Platform 34
- Set ANDROID_HOME environment variable

### Build fails with "Xcode not found" (iOS)
- Install Xcode from Mac App Store
- Run: `sudo xcode-select --switch /Applications/Xcode.app`
- Run: `sudo xcodebuild -license accept`

### "Out of memory" during build
Increase Node memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Still getting errors after rebuild
1. Clear all caches:
   ```bash
   cd frontend
   rm -rf node_modules
   rm -rf .expo
   rm -rf android/build
   rm -rf ios/build
   npm install
   npx expo prebuild --clean
   ```

2. Rebuild:
   ```bash
   npx expo run:android
   ```

## Summary

The fix is simple: **Rebuild your development build**

```bash
cd frontend
npx expo prebuild --clean
npx expo run:android
```

This will include expo-crypto and all other native modules in your app.
