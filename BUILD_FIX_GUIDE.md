# 🔧 Build Fix Guide

## Issue
Gradle build failed after Clerk migration and AI suggestions implementation.

## ✅ Fix Applied

Added Clerk plugin to `app.json`:
```json
"plugins": [
  "expo-router",
  "expo-dev-client",
  // ... other plugins
  ["@clerk/clerk-expo"]  // ← Added this
]
```

## 🚀 Next Steps

### Step 1: Clean Everything
```bash
cd frontend

# Remove build artifacts
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force android  # if exists
Remove-Item -Recurse -Force ios      # if exists
Remove-Item package-lock.json

# Fresh install
npm install
```

### Step 2: Verify Dependencies
Make sure these are in `package.json`:
```json
{
  "dependencies": {
    "@clerk/clerk-expo": "^2.x.x",
    "expo-secure-store": "~13.x.x",
    "zustand": "^4.x.x"
  }
}
```

### Step 3: Run Prebuild (if needed)
```bash
npx expo prebuild --clean
```

### Step 4: Build Again
```bash
eas build --profile development --platform android
```

## 🐛 If Build Still Fails

### Check 1: Clerk Configuration
Verify `.env` file exists with:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Check 2: Package Versions
```bash
npm list @clerk/clerk-expo
npm list expo-secure-store
npm list zustand
```

All should show installed versions.

### Check 3: Clear EAS Cache
```bash
eas build --profile development --platform android --clear-cache
```

### Check 4: Check Build Logs
Look for specific errors in the EAS build logs:
- Missing dependencies
- Version conflicts
- Gradle configuration issues

## 🔍 Common Issues

### Issue: "Cannot find module @clerk/clerk-expo"
**Fix:**
```bash
npm install @clerk/clerk-expo expo-secure-store
```

### Issue: "Duplicate class found"
**Fix:** Clear all caches and rebuild:
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
npm install
npx expo prebuild --clean
```

### Issue: "Gradle build failed"
**Fix:** Check `android/build.gradle` (if exists) for:
- Correct Gradle version
- Correct Android SDK versions
- No conflicting dependencies

## 📝 Build Command Reference

```bash
# Development build (for testing)
eas build --profile development --platform android

# Preview build (for internal testing)
eas build --profile preview --platform android

# Production build (for Play Store)
eas build --profile production --platform android

# Clear cache and rebuild
eas build --profile development --platform android --clear-cache

# Local build (if you have Android Studio)
eas build --profile development --platform android --local
```

## ✅ Verification Steps

After successful build:

1. **Download APK** from EAS dashboard
2. **Install on device**
3. **Test Clerk auth**:
   - Sign up with email
   - Verify email code
   - Sign in
   - Sign out

4. **Test AI Suggestions**:
   - Grant permission
   - Receive messages
   - See suggestion cards
   - Tap actions

## 🆘 Still Having Issues?

### Option 1: Revert Clerk (Temporary)
If you need to build urgently, you can temporarily revert Clerk:

1. Remove Clerk from `app.json` plugins
2. Comment out Clerk imports in `_layout.tsx`
3. Use old Firebase auth temporarily
4. Build and test AI suggestions separately

### Option 2: Use Expo Go (Limited)
For quick testing (won't work with all features):
```bash
npx expo start
```
Then scan QR code with Expo Go app.

**Note:** Clerk and some native modules won't work in Expo Go.

### Option 3: Contact Support
- EAS Build Support: https://expo.dev/support
- Clerk Support: https://clerk.com/support
- Check Expo Discord: https://chat.expo.dev

## 📊 Build Status Checklist

- [ ] `app.json` has Clerk plugin
- [ ] `.env` has Clerk keys
- [ ] `node_modules` installed fresh
- [ ] `.expo` folder cleared
- [ ] `package.json` has all dependencies
- [ ] Build command executed
- [ ] Build logs checked for errors
- [ ] APK downloaded and tested

## 🎯 Expected Result

After fixing:
- ✅ Build completes successfully
- ✅ APK installs on device
- ✅ Clerk authentication works
- ✅ AI suggestions appear
- ✅ All features functional

---

**Current Status:** Clerk plugin added to `app.json`. Ready to rebuild.

**Next Command:**
```bash
cd frontend
eas build --profile development --platform android
```
