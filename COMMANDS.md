# 🎯 Quick Command Reference

## 📍 Current Location
You are here: `C:\Users\sangh\Downloads\chat-app`

---

## 🚀 Build Development Client

### Navigate to Frontend First
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
```

### Option 1: EAS Build (Recommended)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
```

### Option 2: Local Build
```bash
npx expo prebuild --clean
npx react-native run-android
```

---

## 🏃 Run the App

### Start Backend (Terminal 1)
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm install
npm start
```

### Start Frontend (Terminal 2)
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npm install
npx expo start --dev-client
```

---

## 🔧 Setup Commands

### Install Dependencies
```bash
# Backend
cd C:\Users\sangh\Downloads\chat-app\backend
npm install

# Frontend
cd C:\Users\sangh\Downloads\chat-app\frontend
npm install
```

### Update EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

---

## 📱 Device Commands

### Check Connected Devices
```bash
adb devices
```

### Install APK Manually
```bash
adb install path/to/app.apk
```

### View Device Logs
```bash
adb logcat
```

---

## 🧹 Clean Commands

### Clean Frontend Build
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
rm -rf node_modules
rm -rf .expo
npm install
```

### Clean Backend
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
rm -rf node_modules
npm install
```

### Clean Native Build
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
rm -rf android
rm -rf ios
npx expo prebuild --clean
```

---

## 🔍 Debug Commands

### Check Expo Version
```bash
npx expo --version
```

### Check EAS Version
```bash
eas --version
```

### Check Node Version
```bash
node --version
```

### Check NPM Version
```bash
npm --version
```

### View Backend Logs
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
# Logs will show in terminal
```

### View Frontend Logs
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo start --dev-client
# Press 'j' to open debugger
```

---

## 📦 Package Management

### Update All Packages (Frontend)
```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
npm update
```

### Update All Packages (Backend)
```bash
cd C:\Users\sangh\Downloads\chat-app\backend
npm update
```

### Check Outdated Packages
```bash
npm outdated
```

---

## 🎯 Most Common Commands

```bash
# 1. Navigate to frontend
cd C:\Users\sangh\Downloads\chat-app\frontend

# 2. Build development client (first time only)
eas build --profile development --platform android

# 3. Start backend (keep running)
cd C:\Users\sangh\Downloads\chat-app\backend
npm start

# 4. Start frontend (keep running)
cd C:\Users\sangh\Downloads\chat-app\frontend
npx expo start --dev-client
```

---

## ⚠️ Common Mistakes

### ❌ Wrong: Running from root directory
```bash
C:\Users\sangh\Downloads\chat-app> npx expo start
# Error: package.json not found
```

### ✅ Correct: Navigate to frontend first
```bash
C:\Users\sangh\Downloads\chat-app> cd frontend
C:\Users\sangh\Downloads\chat-app\frontend> npx expo start
```

### ❌ Wrong: Using Expo Go
```bash
npx expo start
# Then opening in Expo Go app
# Error: expo-av not available
```

### ✅ Correct: Using development client
```bash
npx expo start --dev-client
# Then opening in development client app
```

---

## 📚 Documentation Files

- `BUILD_GUIDE.md` - Detailed build instructions
- `SETUP_COMPLETE.md` - Complete setup guide
- `QUICK_START_GUIDE.md` - Quick start reference
- `INTEGRATION_COMPLETE.md` - Feature integration guide

---

## 💡 Pro Tips

1. Always navigate to the correct directory first
2. Keep backend and frontend running in separate terminals
3. Use `--dev-client` flag when starting Expo
4. Check logs in both terminals for errors
5. Restart both servers if you encounter connection issues

---

## 🆘 Getting Help

If you're stuck:

1. Check you're in the right directory: `pwd`
2. Check the error message carefully
3. Look for the error in the documentation files
4. Try cleaning and reinstalling: `rm -rf node_modules && npm install`
5. Check `BUILD_GUIDE.md` for troubleshooting

---

**Remember**: Always `cd` to the correct directory before running commands! 🎯
