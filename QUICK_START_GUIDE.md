# Quick Start Guide

## ⚠️ IMPORTANT: Running the Project

You are currently in the **root directory** (`C:\Users\sangh\Downloads\chat-app\`), but the frontend and backend are in separate folders.

### Project Structure
```
chat-app/
├── frontend/          ← React Native Expo app
│   ├── package.json
│   └── app/
├── backend/           ← Node.js Express server
│   ├── package.json
│   └── index.ts
└── README files
```

## 🚀 How to Run

### 1. Start Backend Server

Open a terminal and run:

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### 2. Start Frontend App

Open a **NEW terminal** and run:

```bash
cd frontend
npx expo start
```

## ✅ Current Status

### Backend (100% Complete)
- ✅ All TypeScript errors fixed
- ✅ Voice messages implemented
- ✅ Pinned messages implemented
- ✅ Emoji reactions implemented
- ✅ Socket.IO events working
- ⚠️ **NEEDS**: Cloudinary credentials in `backend/.env`

### Frontend (100% Complete)
- ✅ All TypeScript errors fixed
- ✅ All UI components created
- ✅ Voice recorder with visual feedback
- ✅ Voice message playback
- ✅ Pinned message banner
- ✅ Emoji reaction picker
- ✅ Full integration in Conversation.tsx
- ⚠️ **NEEDS**: Development build (expo-av requires native modules)

## 🔧 Required Setup Steps

### Step 1: Add Cloudinary Credentials

Edit `backend/.env` and add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these from: https://cloudinary.com/console

### Step 2: Build Development Client

**IMPORTANT**: Navigate to the frontend directory first:

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
```

The app uses `expo-av` for audio recording, which requires native modules. You cannot use Expo Go.

**Option A: EAS Build (Recommended)**

```bash
npm install -g eas-cli
eas build:configure
eas build --profile development --platform android
```

**Option B: Local Build**

```bash
npx expo prebuild --clean
npx react-native run-android
```

See `BUILD_GUIDE.md` for detailed step-by-step instructions.

### Step 3: Test Features

Once the development build is installed:

1. **Voice Messages**: Long-press the microphone button to record
2. **Emoji Reactions**: Long-press any message to show emoji picker
3. **Pinned Messages**: Will show in banner at top (pin UI needs admin context menu)

## 🐛 Common Issues

### Issue: "package.json does not exist"
**Solution**: You're in the wrong directory. Run `cd frontend` first.

### Issue: "expo-av native module error"
**Solution**: You need a development build. Cannot use Expo Go. Follow Step 2 above.

### Issue: "Voice upload failed"
**Solution**: Add Cloudinary credentials to `backend/.env` (Step 1 above).

### Issue: "Socket not connected"
**Solution**: Make sure backend is running on `http://localhost:5000`

## 📱 Google Sign-In Setup

The Google Sign-In code is complete, but you need to:

1. Download NEW `google-services.json` from Firebase Console
   - Project: `bubbles-b2e10-5b9ce`
   - App: `com.chatzi.app`
   - **IMPORTANT**: Download AFTER adding SHA-1 fingerprint

2. Replace `frontend/google-services.json` with the new file

3. Verify the new file contains `oauth_client` with `client_type: 1`

4. Run: `npx expo prebuild --clean`

5. Build: `eas build --profile development --platform android`

## 📚 Documentation

- `PROJECT_OVERVIEW.md` - Complete project documentation
- `GOOGLE_SIGNIN_FINAL_SETUP.md` - Google Sign-In setup guide
- `ADVANCED_FEATURES_IMPLEMENTATION.md` - Technical docs for voice/pin/reactions
- `INTEGRATION_COMPLETE.md` - Complete integration guide with troubleshooting

## 🎯 Next Steps

1. Navigate to correct directory: `cd frontend`
2. Add Cloudinary credentials to backend
3. Build development client
4. Test all features
5. Download new google-services.json for Google Sign-In

---

**Need Help?** Check the documentation files listed above for detailed guides.
