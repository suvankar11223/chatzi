# 🎯 Google Sign-In - Final Setup Guide

## ✅ What's Already Done

### Code Implementation (100% Complete)
- ✅ `frontend/services/googleAuthService.ts` - Google authentication service
- ✅ `frontend/components/GoogleButton.tsx` - Reusable Google button component
- ✅ `frontend/context/authContext.tsx` - Extended with `signInWithGoogle()` method
- ✅ `frontend/app/(auth)/login.tsx` - Google button added with OR divider
- ✅ `frontend/app/(auth)/register.tsx` - Google button added with OR divider
- ✅ `frontend/app/_layout.tsx` - Google SDK initialization
- ✅ `frontend/app.json` - Firebase plugins configured
- ✅ `frontend/types.ts` - TypeScript types updated
- ✅ Dependencies installed:
  - `@react-native-firebase/app`
  - `@react-native-firebase/auth`
  - `@react-native-google-signin/google-signin`

### Configuration (Updated)
- ✅ Package name: `com.chatzi.app`
- ✅ Firebase project: `bubbles-b2e10-5b9ce` (NEW PROJECT)
- ✅ Web Client ID: `460437326375-4ci97riqems0vn3r2htac2vfbulogjab.apps.googleusercontent.com`
- ✅ SHA-1 fingerprint: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`
- ✅ SHA-1 added to Firebase Console
- ✅ Google Sign-In provider enabled in Firebase Authentication

---

## 🚨 Critical Next Step

### Download Updated google-services.json

Your current `google-services.json` has an **empty `oauth_client` array** because you downloaded it BEFORE adding the SHA-1 fingerprint.

**You MUST download it again NOW:**

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com
   - Project: `bubbles-b2e10-5b9ce`

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ (top left)
   - Click "Project settings"

3. **Find Your Android App**
   - Scroll to "Your apps" section
   - Find: **Chatzi** (`com.chatzi.app`)

4. **Download google-services.json**
   - Click the **"google-services.json"** download button
   - Save the file

5. **Replace the File**
   - Copy the downloaded file
   - Replace: `frontend/google-services.json`
   - Make sure it's named exactly `google-services.json`

---

## 🔍 Verify the Downloaded File

Open the downloaded `google-services.json` and verify it has:

```json
{
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.chatzi.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "SOME_REAL_ID.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.chatzi.app",
            "certificate_hash": "5e8f16062ea3cd2c4a0d547876baa6f38cabf625"
          }
        },
        {
          "client_id": "460437326375-4ci97riqems0vn3r2htac2vfbulogjab.apps.googleusercontent.com",
          "client_type": 3
        }
      ]
    }
  ]
}
```

**Key things to check:**
- ✅ `oauth_client` array is NOT empty
- ✅ Has `client_type: 1` (Android OAuth client)
- ✅ Has `certificate_hash: "5e8f16062ea3cd2c4a0d547876baa6f38cabf625"`
- ✅ Has `client_type: 3` (Web OAuth client)

---

## 🏗️ Build the App

After replacing `google-services.json`:

```bash
cd frontend

# Clean prebuild
npx expo prebuild --clean

# Build with EAS
eas build --profile development --platform android
```

Wait for the build to complete (~10-15 minutes).

---

## 📱 Test Google Sign-In

1. **Download APK** from EAS build
2. **Install** on your Android device
3. **Open** the app
4. **Go to Login or Register** screen
5. **Tap "Continue with Google"**
6. **Select your Google account**
7. **Should work!** ✅

---

## 🎯 Firebase Project Details

### New Firebase Project
- **Project ID**: `bubbles-b2e10-5b9ce`
- **Project Number**: `460437326375`
- **Project Name**: bubbles-b2e10-5b9ce

### Android App
- **Package Name**: `com.chatzi.app`
- **App Nickname**: Chatzi
- **App ID**: `1:460437326375:android:24de87996405e2c9c3dc02`

### Credentials
- **Web Client ID**: `460437326375-4ci97riqems0vn3r2htac2vfbulogjab.apps.googleusercontent.com`
- **API Key**: `AIzaSyCFO9cUu-wJFE0AD_1itjhV3e4bGbR-bUc`
- **SHA-1**: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`

---

## 🔄 How Google Sign-In Works

### User Flow
1. User taps "Continue with Google" button
2. Google Sign-In SDK opens account picker
3. User selects Google account
4. SDK returns ID token to app
5. App sends ID token to Firebase Auth
6. Firebase validates token and returns user data
7. App sends user data to backend
8. Backend creates/updates user in MongoDB
9. Backend returns JWT token
10. App stores token and connects Socket.IO
11. User redirected to home screen

### Technical Flow
```
Mobile App (React Native)
    ↓
Google Sign-In SDK
    ↓
Google Account Picker
    ↓
ID Token
    ↓
Firebase Authentication
    ↓
User Data (email, name, avatar)
    ↓
Backend API (/api/auth/google-signin)
    ↓
MongoDB (create/update user)
    ↓
JWT Token
    ↓
AsyncStorage (store token)
    ↓
Socket.IO Connection
    ↓
Home Screen
```

---

## 🎨 UI Implementation

### Login Screen
```
┌─────────────────────────────┐
│  ← Forgot Your Password     │
│                             │
│  Welcome Back 😊            │
│  Happy to see you again!    │
│                             │
│  📧 Enter your email        │
│  🔒 Enter your password     │
│                             │
│  [    Lets Go    ]          │
│                             │
│  ────── OR ──────           │
│                             │
│  [🔵 Continue with Google]  │
│                             │
│  Don't have an account?     │
│  Sign Up                    │
└─────────────────────────────┘
```

### Register Screen
```
┌─────────────────────────────┐
│  ← Already have an account? │
│                             │
│  Let's Get Started 🚀       │
│  Create your account        │
│                             │
│  👤 Enter your name         │
│  📧 Enter your email        │
│  🔒 Enter your password     │
│                             │
│  [    Sign Up    ]          │
│                             │
│  ────── OR ──────           │
│                             │
│  [🔵 Continue with Google]  │
│                             │
│  Already have an account?   │
│  Login                      │
└─────────────────────────────┘
```

---

## 🔧 Code Structure

### Files Modified/Created

**Frontend**
```
frontend/
├── services/
│   └── googleAuthService.ts      ← Google auth logic
├── components/
│   └── GoogleButton.tsx          ← Google button UI
├── context/
│   └── authContext.tsx           ← Added signInWithGoogle()
├── app/
│   ├── (auth)/
│   │   ├── login.tsx            ← Added Google button
│   │   └── register.tsx         ← Added Google button
│   └── _layout.tsx              ← Initialize Google SDK
├── types.ts                      ← Updated types
├── app.json                      ← Firebase config
└── google-services.json          ← Firebase credentials
```

**Backend** (No changes needed)
- Backend already supports Google Sign-In via existing auth endpoints
- User model supports `googleId` field
- JWT token generation works the same

---

## 🐛 Troubleshooting

### Error: DEVELOPER_ERROR
**Cause**: `google-services.json` missing Android OAuth client with SHA-1

**Solution**: Download NEW `google-services.json` from Firebase Console AFTER adding SHA-1

### Error: Sign-In Cancelled
**Cause**: User cancelled the Google account picker

**Solution**: This is normal user behavior, no action needed

### Error: Play Services Not Available
**Cause**: Google Play Services not installed or outdated

**Solution**: Update Google Play Services on device

### Error: Network Error
**Cause**: Device not connected to internet

**Solution**: Check internet connection

---

## 📋 Final Checklist

Before building:
- [ ] Downloaded NEW `google-services.json` from Firebase Console
- [ ] Replaced `frontend/google-services.json` with downloaded file
- [ ] Verified `oauth_client` array is NOT empty
- [ ] Verified SHA-1 is in Firebase Console
- [ ] Verified Google Sign-In is enabled in Firebase Authentication
- [ ] Web Client ID is correct in `googleAuthService.ts`
- [ ] iOS URL scheme is correct in `app.json`

After building:
- [ ] APK downloaded from EAS
- [ ] APK installed on device
- [ ] App opens successfully
- [ ] Login screen shows Google button
- [ ] Register screen shows Google button
- [ ] Tapping Google button opens account picker
- [ ] Selecting account signs in successfully
- [ ] User redirected to home screen
- [ ] Socket.IO connected
- [ ] Can send messages

---

## 🎉 Success Criteria

Google Sign-In is working when:
1. ✅ Google button appears on login/register screens
2. ✅ Tapping button opens Google account picker
3. ✅ Selecting account signs in without errors
4. ✅ User profile created in MongoDB
5. ✅ JWT token stored in AsyncStorage
6. ✅ Socket.IO connected
7. ✅ User redirected to home screen
8. ✅ Can see contacts and conversations
9. ✅ Can send messages
10. ✅ Can make calls

---

## 🚀 Next Steps After Google Sign-In Works

1. **Test thoroughly**
   - Test on multiple devices
   - Test with different Google accounts
   - Test sign out and sign in again
   - Test offline/online scenarios

2. **Add features**
   - Profile picture from Google
   - Email verification
   - Account linking (email + Google)
   - Sign in with Apple (iOS)

3. **Production deployment**
   - Add production SHA-1 (from release keystore)
   - Configure production Firebase project
   - Update OAuth consent screen
   - Add privacy policy URL
   - Add terms of service URL

---

## 📞 Need Help?

If you're stuck:
1. Check Firebase Console for errors
2. Check app logs for error messages
3. Verify SHA-1 is correct
4. Verify `google-services.json` has OAuth client
5. Try uninstalling and reinstalling app
6. Try clearing app data
7. Try rebuilding with `--clean` flag

---

**Remember**: The ONLY thing you need to do now is download the NEW `google-services.json` file from Firebase Console and rebuild the app!

**Good luck! 🚀**
