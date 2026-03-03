# 🚀 Bublizi - Quick Reference Guide

## 📋 Table of Contents
1. [Build Commands](#build-commands)
2. [Start Commands](#start-commands)
3. [Testing](#testing)
4. [File Structure](#file-structure)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## ⚠️ IMPORTANT: Build First, Then Use Dev Client!

**You CANNOT use `npx expo start --dev-client` until you build and install the development APK first!**

The error `Cannot find native module 'ExpoCrypto'` means you're trying to use native modules that haven't been compiled yet.

### Correct Order:
1. **Build development APK** (do this ONCE)
2. **Install APK on device**
3. **THEN run `npx expo start --dev-client`**

---

## 🚀 Build Command

### Build for Testing (Development)
```bash
cd frontend
eas build --profile development --platform android
```

### Build for Production
```bash
cd frontend
eas build --profile production --platform android
```

### Build with Cache Clear
```bash
cd frontend
eas build --profile development --platform android --clear-cache
```

### Or Use Batch File
```bash
# Double-click in Windows Explorer:
BUILD_NOW.bat
```

---

## ▶️ Start Commands

### Option 1: Start Everything (Recommended)
```bash
# Double-click in Windows Explorer:
start-dev.bat
```
Opens 2 windows:
- Backend server (http://localhost:3000)
- Frontend dev client (scan QR code)

### Option 2: Backend Only
```bash
# Double-click in Windows Explorer:
start-backend-only.bat
```
Use this when testing the installed APK on device.

### Option 3: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (for development):**
```bash
cd frontend
npx expo start --dev-client
```

---

## 🧪 Testing

### After Build Completes:

1. **Download APK**
   - Go to: https://expo.dev/accounts/babu223/projects/bublizi/builds
   - Download latest build
   - Install on Android device

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

3. **Test on Device**
   - Open Bublizi app
   - Sign up with email
   - Verify email code
   - Test features

### Test Clerk Authentication:
```
✓ Open app → Welcome screen
✓ Tap "Sign Up"
✓ Enter: name, email, password
✓ Check email for verification code
✓ Enter 6-digit code
✓ Should redirect to home
✓ Sign out
✓ Sign in again
```

### Test AI Suggestions:
```
✓ Permission modal appears
✓ Grant permission
✓ Have someone send messages
✓ Wait 2 seconds
✓ Suggestion cards appear
✓ Swipe through cards
✓ Tap action buttons
```

---

## 📁 File Structure

```
chat-app/
├── backend/
│   ├── index.ts              # Main server file
│   ├── .env                  # Backend environment variables
│   ├── controller/           # API controllers
│   ├── routes/               # API routes
│   ├── socket/               # Socket.io events
│   └── modals/               # Database models
│
├── frontend/
│   ├── app/                  # Expo Router pages
│   │   ├── _layout.tsx       # Root layout (ClerkProvider)
│   │   ├── (auth)/           # Auth screens
│   │   └── (main)/           # Main app screens
│   ├── components/           # Reusable components
│   │   └── suggestions/      # AI suggestion components
│   ├── services/             # API services
│   │   └── suggestions/      # AI suggestion services
│   ├── hooks/                # Custom hooks
│   │   └── suggestions/      # AI suggestion hooks
│   ├── context/              # React contexts
│   ├── .env                  # Frontend environment variables
│   └── app.json              # Expo configuration
│
├── BUILD_NOW.bat             # Build the app
├── start-dev.bat             # Start both servers
├── start-backend-only.bat    # Start backend only
├── HOW_TO_START.md           # Detailed start guide
├── CLERK_DONE.md             # Clerk migration summary
└── QUICK_REFERENCE.md        # This file
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=https://chatzi-1m0m.onrender.com
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Package '@clerk/clerk-expo' does not contain a valid config plugin"**
- ✅ Fixed: Clerk removed from app.json plugins

**Error: "No matching client found for package name"**
- ✅ Fixed: google-services.json deleted

**Error: "Unexpected token 'typeof'"**
- ✅ Fixed: app.json syntax corrected

### App Won't Start

**"Cannot connect to server"**
```bash
# Make sure backend is running:
cd backend
npm start
```

**"Clerk authentication fails"**
- Check frontend/.env has Clerk keys
- Make sure using dev build (not Expo Go)

**"App crashes on startup"**
- Uninstall old version
- Install fresh APK
- Clear app data

### Development Issues

**"Hot reload not working"**
- Use: `npx expo start --dev-client`
- Device and computer on same WiFi
- Shake device → "Reload"

**"Changes not appearing"**
- If using APK only: Need to rebuild
- If using dev client: Should auto-reload

---

## 📱 Device Requirements

### For Development Build:
- Android 5.0+ (API 21+)
- 100MB+ free space
- Internet connection
- Same WiFi as computer (for dev client)

### For Production Build:
- Android 5.0+ (API 21+)
- 100MB+ free space
- Internet connection

---

## 🎯 Common Tasks

### Add New Feature
1. Edit code in VS Code
2. If using dev client: See changes instantly
3. If using APK: Rebuild with `eas build`

### Update Backend
1. Edit backend code
2. Restart backend server (Ctrl+C, then `npm start`)
3. Test on device

### Update Dependencies
```bash
# Frontend
cd frontend
npm install package-name

# Backend
cd backend
npm install package-name
```

### Clear Cache
```bash
# Frontend
cd frontend
rm -rf node_modules .expo
npm install

# Backend
cd backend
rm -rf node_modules
npm install
```

---

## 🔗 Important Links

- **EAS Builds**: https://expo.dev/accounts/babu223/projects/bublizi/builds
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Backend (Production)**: https://chatzi-1m0m.onrender.com
- **Backend (Local)**: http://localhost:3000

---

## 📞 Support

### Documentation Files:
- `HOW_TO_START.md` - Detailed startup guide
- `CLERK_DONE.md` - Clerk migration details
- `AI_SUGGESTIONS_COMPLETE.md` - AI feature docs
- `BUILD_FIX_GUIDE.md` - Build troubleshooting

### Quick Commands:
```bash
# Build
eas build --profile development --platform android

# Start backend
cd backend && npm start

# Start frontend dev
cd frontend && npx expo start --dev-client

# Check backend health
curl http://localhost:3000/health
```

---

## ✅ Current Status

- ✅ Clerk authentication integrated
- ✅ Firebase completely removed
- ✅ AI Suggestions feature complete
- ✅ Package name: com.chinmayee.bublizi
- ✅ All TypeScript checks passing
- ✅ Build configuration clean
- ✅ Ready to build and test

---

## 🎊 Next Steps

1. **Build the app**: Run `BUILD_NOW.bat` or `eas build`
2. **Wait for build**: Check EAS dashboard
3. **Download APK**: Install on device
4. **Start backend**: Run `start-backend-only.bat`
5. **Test app**: Open on device and test features
6. **For development**: Use `start-dev.bat` for hot reload

---

**Last Updated**: After Clerk migration and AI Suggestions implementation
**App Version**: 1.0.0
**Package**: com.chinmayee.bublizi
