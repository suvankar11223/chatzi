# 🔧 Dev Server Troubleshooting Guide

## Common Issues & Solutions

### 1. "Unable to resolve expo-auth-session"

**Error:**
```
Unable to resolve "expo-auth-session" from "node_modules\@clerk\clerk-expo\dist\hooks\useSSO.js"
```

**Fix:**
```bash
cd frontend
npm install expo-auth-session expo-web-browser
```

**Status:** ✅ FIXED

---

### 2. "Port 8081 is being used"

**Error:**
```
Port 8081 is being used by another process
Use port 8082 instead? (Y/n)
```

**Fix Option 1 - Accept Different Port:**
- Type `Y` and press Enter
- Dev server will use port 8082 instead

**Fix Option 2 - Kill Process on Port 8081:**
```bash
# Find process using port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Fix Option 3 - Use start-dev.bat:**
The batch file automatically accepts port changes:
```
Double-click: start-dev.bat
```

---

### 3. "Cannot find module"

**Error:**
```
Cannot find module 'some-package'
```

**Fix:**
```bash
cd frontend
npm install
```

If still failing:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### 4. "Metro bundler failed"

**Error:**
```
Metro bundler has encountered an error
```

**Fix:**
```bash
cd frontend
npx expo start --dev-client --clear
```

Or clear cache manually:
```bash
cd frontend
rm -rf .expo node_modules/.cache
npx expo start --dev-client
```

---

### 5. "Device not connecting"

**Symptoms:**
- QR code appears but device won't connect
- "Unable to connect to Metro" on device

**Fix:**

1. **Check WiFi:**
   - Device and computer must be on same WiFi network
   - Disable VPN if active

2. **Check Firewall:**
   - Allow Node.js through Windows Firewall
   - Allow port 8081 (or 8082)

3. **Try Tunnel Mode:**
   ```bash
   cd frontend
   npx expo start --dev-client --tunnel
   ```

4. **Manual Connection:**
   - Note your computer's IP address
   - On device, shake → "Enter URL manually"
   - Enter: `exp://YOUR_IP:8081`

---

### 6. "Clerk authentication fails in dev"

**Error:**
- Sign up/in doesn't work
- "Clerk is not loaded" error

**Fix:**

1. **Check .env file:**
   ```bash
   # frontend/.env should have:
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   cd frontend
   npx expo start --dev-client
   ```

3. **Check you're using dev build:**
   - Clerk doesn't work in Expo Go
   - Must use development build APK

---

### 7. "Backend not responding"

**Symptoms:**
- App can't connect to server
- API calls fail

**Fix:**

1. **Check backend is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Check backend health:**
   - Visit: http://localhost:3000/health
   - Should return: `{"status":"ok"}`

3. **Check frontend .env:**
   ```bash
   # frontend/.env should have:
   EXPO_PUBLIC_API_URL=https://chatzi-1m0m.onrender.com
   ```

---

### 8. "Hot reload not working"

**Symptoms:**
- Code changes don't appear
- Need to manually reload

**Fix:**

1. **Enable Fast Refresh:**
   - Shake device
   - Tap "Enable Fast Refresh"

2. **Restart dev server:**
   ```bash
   cd frontend
   npx expo start --dev-client --clear
   ```

3. **Check file is saved:**
   - Make sure you saved the file (Ctrl+S)
   - Check VS Code shows no unsaved indicator

---

### 9. "TypeScript errors in terminal"

**Error:**
```
Type error: Property 'x' does not exist on type 'y'
```

**Fix:**

1. **Check with getDiagnostics:**
   - These are just warnings in dev mode
   - App will still run

2. **Fix the actual error:**
   - Open the file mentioned
   - Fix the TypeScript error
   - Save file

3. **Ignore if false positive:**
   - Sometimes TypeScript is overly strict
   - If app works, you can ignore

---

### 10. "Expo CLI not found"

**Error:**
```
'npx' is not recognized as an internal or external command
```

**Fix:**

1. **Install Node.js:**
   - Download from: https://nodejs.org
   - Install LTS version
   - Restart terminal

2. **Verify installation:**
   ```bash
   node --version
   npm --version
   npx --version
   ```

---

## 🚀 Quick Fixes Checklist

When dev server won't start, try these in order:

- [ ] Install missing dependencies: `npm install`
- [ ] Clear cache: `npx expo start --dev-client --clear`
- [ ] Accept different port when prompted
- [ ] Check backend is running
- [ ] Check .env files exist
- [ ] Restart terminal
- [ ] Restart computer (last resort)

---

## 📱 Device Connection Checklist

When device won't connect:

- [ ] Device and computer on same WiFi
- [ ] Dev build installed (not Expo Go)
- [ ] QR code scanned correctly
- [ ] Firewall allows Node.js
- [ ] VPN disabled
- [ ] Try tunnel mode: `--tunnel`

---

## 🎯 Working Configuration

When everything works, you should see:

**Terminal:**
```
Starting Metro Bundler
› Metro waiting on exp://192.168.1.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**Device:**
```
Connected to Metro
Fast Refresh enabled
```

**Backend:**
```
Server running on port 3000
MongoDB connected
Socket.io initialized
```

---

## 🆘 Still Having Issues?

### Check Logs:

**Frontend logs:**
```bash
cd frontend
npx expo start --dev-client --verbose
```

**Backend logs:**
- Check terminal where backend is running
- Look for error messages

**Device logs:**
- Shake device → "Show Dev Menu"
- Tap "Debug Remote JS"
- Open Chrome DevTools

### Get Help:

1. **Check documentation:**
   - `HOW_TO_START.md`
   - `QUICK_REFERENCE.md`
   - `CLERK_DEPENDENCIES_FIXED.md`

2. **Check Expo docs:**
   - https://docs.expo.dev

3. **Check Clerk docs:**
   - https://clerk.com/docs

---

## 📊 System Requirements

### Minimum:
- Node.js 18+
- npm 9+
- Windows 10+
- Android 5.0+ (device)
- 100MB free space

### Recommended:
- Node.js 20+
- npm 10+
- Windows 11
- Android 12+ (device)
- 500MB free space
- Fast WiFi connection

---

**Most issues are solved by installing missing dependencies or clearing cache!** 🎉
