# 🎉 Your Build is Complete! Here's What to Do Next

## 📥 Step 1: Download & Install APK

1. **Go to EAS Dashboard**
   - Visit: https://expo.dev/accounts/babu223/projects/bublizi/builds
   - Find your latest build (should be at the top)
   - Click the "Download" button

2. **Transfer to Your Android Device**
   - Option A: USB cable → Copy APK to device
   - Option B: Email APK to yourself → Open on device
   - Option C: Upload to cloud (Google Drive, Dropbox) → Download on device

3. **Install on Device**
   - Tap the APK file on your device
   - Allow "Install from unknown sources" if prompted
   - Tap "Install"
   - Wait for installation to complete
   - Tap "Open" or find "Bublizi" in your app drawer

---

## 🖥️ Step 2: Start Backend Server

The app needs the backend running to work!

### Easy Way (Double-click):
```
start-backend-only.bat
```

### Manual Way:
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
```

You should see:
```
Server running on port 3000
MongoDB connected
Socket.io initialized
```

**Keep this terminal window open!** The backend must stay running while you use the app.

---

## 📱 Step 3: Test the App

### First Launch:
1. Open Bublizi app on your device
2. You'll see the Welcome screen
3. Tap "Get Started" or "Sign Up"

### Create Account:
1. Enter your name
2. Enter your email
3. Create a password (min 8 characters)
4. Tap "Sign Up"
5. Check your email for verification code
6. Enter the 6-digit code
7. You'll be redirected to the home screen

### Test Features:
- ✅ **AI Permission Modal** - Should appear after 1 second
- ✅ **Grant Permission** - Tap "Enable Suggestions"
- ✅ **View Conversations** - See your chat list
- ✅ **Send Messages** - Tap a conversation or create new
- ✅ **AI Suggestions** - Cards appear above chat list after receiving messages
- ✅ **Voice Messages** - Hold mic button to record
- ✅ **Video/Audio Calls** - Tap call buttons
- ✅ **Profile** - Tap your avatar to edit profile

---

## 🔄 For Active Development (Hot Reload)

If you want to make code changes and see them instantly:

### Easy Way (Double-click):
```
start-dev.bat
```

This opens 2 windows:
1. Backend server
2. Frontend dev client with QR code

### Then on Your Device:
1. Open the Bublizi app (the dev build you installed)
2. Shake your device
3. Tap "Scan QR Code"
4. Scan the QR code from the terminal
5. App reloads with dev mode enabled

Now when you edit code in VS Code, changes appear instantly on your device!

---

## 🎯 What Each Script Does

### `BUILD_NOW.bat`
- Builds the APK using EAS
- Use this when you want to create a new build

### `start-backend-only.bat`
- Starts just the backend server
- Use this when testing the installed APK

### `start-dev.bat`
- Starts backend + frontend dev client
- Use this for active development with hot reload

---

## ✅ Testing Checklist

### Clerk Authentication:
- [ ] App opens to welcome screen
- [ ] Sign up with email/password
- [ ] Receive verification email
- [ ] Enter verification code
- [ ] Redirects to home screen
- [ ] Sign out works
- [ ] Sign in works

### AI Suggestions:
- [ ] Permission modal appears
- [ ] Grant permission
- [ ] Have someone send messages with intents
- [ ] Wait 2 seconds
- [ ] Suggestion cards appear above chat list
- [ ] Can swipe through cards
- [ ] Tap action button works
- [ ] Card dismisses

### Core Features:
- [ ] Send text messages
- [ ] Receive messages in real-time
- [ ] Send voice messages
- [ ] Pin messages
- [ ] React with emojis
- [ ] Make video/audio calls
- [ ] Create group chats
- [ ] Edit profile
- [ ] Upload profile picture

---

## 🐛 If Something Goes Wrong

### "Cannot connect to server"
**Fix:**
```bash
# Make sure backend is running:
cd backend
npm start
```

### "Clerk authentication fails"
**Fix:**
1. Check `frontend/.env` has Clerk keys
2. Make sure you're using the dev build (not Expo Go)
3. Check internet connection

### "App crashes on startup"
**Fix:**
1. Uninstall the app
2. Reinstall fresh APK
3. Clear app data in device settings
4. Try again

### "AI suggestions not appearing"
**Fix:**
1. Make sure you granted permission
2. Have someone send messages with clear intents
3. Wait 2 seconds (debounce delay)
4. Check backend is running

---

## 📊 Backend Health Check

To verify backend is working:

1. **In your browser, visit:**
   ```
   http://localhost:3000/health
   ```

2. **Should return:**
   ```json
   {"status":"ok"}
   ```

3. **If it doesn't work:**
   - Backend isn't running
   - Run `start-backend-only.bat`

---

## 🎨 What You'll See

### Welcome Screen
- Yellow "Get Started" button
- Clean white background
- Bublizi logo

### Sign Up Screen
- Name input
- Email input
- Password input
- Yellow "Sign Up" button

### Verification Screen
- 6-digit code input
- "Verify Email" button
- Resend code option

### Home Screen
- Your profile at top
- Search bar
- Conversation list
- AI suggestion cards (after granting permission)
- Yellow floating "New Chat" button

### Chat Screen
- Messages with timestamps
- Voice message bubbles
- Emoji reactions
- Pinned message banner
- Input with mic button

---

## 🚀 Production Deployment (Later)

When ready to publish:

1. **Build Production APK:**
   ```bash
   cd frontend
   eas build --profile production --platform android
   ```

2. **Upload to Google Play Store:**
   - Create developer account
   - Upload APK
   - Fill in store listing
   - Submit for review

3. **Backend is Already Live:**
   - Production URL: https://chatzi-1m0m.onrender.com
   - Auto-deploys from GitHub

---

## 📚 More Documentation

- **`HOW_TO_START.md`** - Detailed startup guide
- **`QUICK_REFERENCE.md`** - Command reference
- **`CLERK_DONE.md`** - Clerk migration details
- **`AI_SUGGESTIONS_COMPLETE.md`** - AI feature documentation
- **`BUILD_FIX_GUIDE.md`** - Build troubleshooting

---

## 🎊 Summary

### Right Now:
1. **Download APK** from EAS dashboard
2. **Install on device**
3. **Run `start-backend-only.bat`**
4. **Open app and test**

### For Development:
1. **Run `start-dev.bat`**
2. **Scan QR code with device**
3. **Edit code in VS Code**
4. **See changes instantly**

### Backend Must Always Run:
The app needs the backend server running to function. Always start backend first!

---

**You're all set!** 🎉

The app is built, configured, and ready to test. Just download the APK, start the backend, and enjoy your new Clerk-powered, AI-enhanced chat app!
