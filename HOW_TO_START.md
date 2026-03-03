# 🚀 How to Start Bublizi After Build

## 📱 On Your Android Device (Production Testing)

### Step 1: Download & Install APK
1. Go to EAS dashboard: https://expo.dev/accounts/babu223/projects/bublizi/builds
2. Find your latest build
3. Click "Download" to get the APK file
4. Transfer APK to your Android device (via USB, email, or cloud)
5. On your device, tap the APK file to install
6. Allow "Install from unknown sources" if prompted
7. Open the Bublizi app

### Step 2: Start Backend Server
The app needs the backend running to work. Open a terminal:

```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
```

Backend will start on: `http://localhost:3000`

### Step 3: Test the App
- ✅ App opens to welcome screen
- ✅ Sign up with email/password
- ✅ Verify email code
- ✅ Sign in
- ✅ See home screen with conversations
- ✅ AI permission modal appears
- ✅ Grant permission
- ✅ Send/receive messages
- ✅ See AI suggestion cards

---

## 💻 For Development (Testing on Computer)

### Option 1: Expo Dev Client (Recommended)
After building the development APK, you can use it for fast development:

#### Terminal 1 - Backend:
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
```

#### Terminal 2 - Frontend:
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo start --dev-client
```

Then:
1. Scan QR code with your device (that has the dev build installed)
2. App loads with hot reload enabled
3. Make code changes and see them instantly

### Option 2: Expo Go (Limited Features)
For quick UI testing only (Clerk won't work):

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo start
```

Then scan QR code with Expo Go app.

**Note:** Clerk authentication and some native features won't work in Expo Go.

---

## 🔧 Development Workflow

### Daily Development:
1. **Start Backend** (always needed):
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend** (choose one):
   
   **A. With Dev Build (hot reload):**
   ```bash
   cd frontend
   npx expo start --dev-client
   ```
   
   **B. Just test on device:**
   - Open the installed APK on your device
   - No need to run expo start

### Making Changes:
- Edit code in VS Code
- If using dev client: Changes appear instantly
- If using APK only: Rebuild with `eas build` to see changes

---

## 📦 Quick Start Commands

### Start Everything (2 Terminals):

**Terminal 1 - Backend:**
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
```

**Terminal 2 - Frontend Dev:**
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo start --dev-client
```

---

## 🎯 Testing Checklist

### Backend Health Check:
```bash
# In browser, visit:
http://localhost:3000/health
```
Should return: `{"status":"ok"}`

### Frontend Connection:
1. Open app on device
2. Try to sign up/sign in
3. If it works → Backend connected ✅
4. If it fails → Check backend is running

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
**Fix:**
1. Make sure backend is running: `cd backend && npm start`
2. Check backend URL in `frontend/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://chatzi-1m0m.onrender.com
   ```
3. If testing locally, you may need to use your computer's IP instead of localhost

### Issue: "Clerk authentication not working"
**Fix:**
1. Check `frontend/.env` has Clerk keys
2. Make sure you're using the development build APK (not Expo Go)
3. Check Clerk dashboard for any issues

### Issue: "App crashes on startup"
**Fix:**
1. Uninstall old version from device
2. Install fresh APK
3. Clear app data in device settings
4. Try again

### Issue: "Hot reload not working"
**Fix:**
1. Make sure you're using `npx expo start --dev-client`
2. Make sure device and computer are on same WiFi
3. Shake device → "Reload"

---

## 📱 Production Deployment

### When Ready for Production:

1. **Build Production APK:**
   ```bash
   cd frontend
   eas build --profile production --platform android
   ```

2. **Deploy Backend:**
   Your backend is already on Render: `https://chatzi-1m0m.onrender.com`
   
   To update:
   ```bash
   cd backend
   git push origin main
   ```
   (Render auto-deploys on push)

3. **Distribute APK:**
   - Download production APK from EAS
   - Upload to Google Play Store
   - Or distribute directly to users

---

## 🎊 Summary

### For Testing After Build:
1. **Install APK** on Android device
2. **Start backend**: `cd backend && npm start`
3. **Open app** on device
4. **Test features**

### For Active Development:
1. **Terminal 1**: `cd backend && npm start`
2. **Terminal 2**: `cd frontend && npx expo start --dev-client`
3. **Scan QR code** with device (that has dev build)
4. **Code changes** appear instantly

### Backend Must Always Run:
The app needs the backend server running to function. Always start backend first!

---

## 🚀 Quick Start Script

Create `start-dev.bat` in root:

```batch
@echo off
echo Starting Bublizi Development Environment...
echo.

start cmd /k "cd backend && echo === BACKEND === && npm start"
timeout /t 3
start cmd /k "cd frontend && echo === FRONTEND === && npx expo start --dev-client"

echo.
echo Both servers starting...
echo Backend: http://localhost:3000
echo Frontend: Scan QR code with device
echo.
```

Then just double-click `start-dev.bat` to start everything!
