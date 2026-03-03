# 🔄 Bublizi Startup Flowchart

## 📱 After Build Completes

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD COMPLETE                            │
│              (APK ready on EAS dashboard)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Download APK                                        │
│  • Go to EAS dashboard                                       │
│  • Click "Download"                                          │
│  • Transfer to Android device                                │
│  • Install APK                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Start Backend                                       │
│  • Double-click: start-backend-only.bat                      │
│  • OR: cd backend && npm start                               │
│  • Keep terminal open!                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Open App on Device                                  │
│  • Tap Bublizi icon                                          │
│  • See welcome screen                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   New User?      │  │  Existing User?  │
        │   Sign Up        │  │   Sign In        │
        └──────────────────┘  └──────────────────┘
                    │               │
                    └───────┬───────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  HOME SCREEN                                                 │
│  • AI permission modal appears                               │
│  • Grant permission                                          │
│  • See conversations                                         │
│  • AI suggestion cards appear                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  READY TO USE!                                               │
│  ✓ Send messages                                             │
│  ✓ Make calls                                                │
│  ✓ See AI suggestions                                        │
│  ✓ All features working                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Development Mode Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│  WANT TO MAKE CODE CHANGES?                                  │
│  (With hot reload)                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Start Dev Environment                               │
│  • Double-click: start-dev.bat                               │
│  • Opens 2 windows:                                          │
│    - Backend server                                          │
│    - Frontend dev client (QR code)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Connect Device                                      │
│  • Open Bublizi app (dev build)                              │
│  • Shake device                                              │
│  • Tap "Scan QR Code"                                        │
│  • Scan QR from terminal                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Edit Code                                           │
│  • Open VS Code                                              │
│  • Edit any file                                             │
│  • Save (Ctrl+S)                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CHANGES APPEAR INSTANTLY!                                   │
│  • App reloads automatically                                 │
│  • See changes on device                                     │
│  • No rebuild needed                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│  APP NOT WORKING?                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │ "Cannot connect      │  │  "App crashes"       │
    │  to server"          │  │                      │
    └──────────────────────┘  └──────────────────────┘
                │                       │
                ▼                       ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │ Is backend running?  │  │ Uninstall app        │
    │ • Check terminal     │  │ Reinstall APK        │
    │ • Run start-backend  │  │ Clear app data       │
    │ • Visit localhost    │  │ Try again            │
    └──────────────────────┘  └──────────────────────┘
                │                       │
                └───────┬───────────────┘
                        ▼
            ┌──────────────────────┐
            │  Still not working?  │
            │  Check:              │
            │  • Internet          │
            │  • .env files        │
            │  • Clerk keys        │
            │  • Device settings   │
            └──────────────────────┘
```

---

## 📊 Feature Testing Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│  TESTING CLERK AUTHENTICATION                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Open App
                            │
                            ▼
                    Welcome Screen
                            │
                            ▼
                    Tap "Sign Up"
                            │
                            ▼
            Enter Name, Email, Password
                            │
                            ▼
                    Tap "Sign Up"
                            │
                            ▼
                Check Email for Code
                            │
                            ▼
                Enter 6-Digit Code
                            │
                            ▼
                    Tap "Verify"
                            │
                            ▼
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
    ✅ Success!                      ❌ Failed?
    Redirects to Home               Check Clerk keys
                                    Check internet
                                    Try again

┌─────────────────────────────────────────────────────────────┐
│  TESTING AI SUGGESTIONS                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Open App (Signed In)
                            │
                            ▼
                    Home Screen
                            │
                            ▼
            Permission Modal Appears (1 sec)
                            │
                            ▼
                    Grant Permission
                            │
                            ▼
            Have Someone Send Messages
            (with intents like "meet", "call")
                            │
                            ▼
                    Wait 2 Seconds
                            │
                            ▼
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
    ✅ Cards Appear!                 ❌ No Cards?
    Swipe through                   Check permission
    Tap actions                     Check messages
    Test features                   Wait longer
```

---

## 🎯 Quick Decision Tree

```
                    START HERE
                        │
                        ▼
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    Just Testing?           Active Development?
            │                       │
            ▼                       ▼
    start-backend-only.bat    start-dev.bat
            │                       │
            ▼                       ▼
    Open APK on device      Scan QR code
            │                       │
            └───────────┬───────────┘
                        ▼
                    USE APP!
```

---

## 📱 User Journey Map

```
NEW USER JOURNEY:
┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐
│Open │ → │Sign │ → │Verify│ → │Home │ → │Grant│ → │Chat │
│ App │   │ Up  │   │Email │   │Screen│   │ AI  │   │     │
└─────┘   └─────┘   └─────┘   └─────┘   └─────┘   └─────┘
  30s       2min      1min      instant    5s       ongoing

RETURNING USER JOURNEY:
┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐
│Open │ → │Sign │ → │Home │ → │Chat │
│ App │   │ In  │   │Screen│   │     │
└─────┘   └─────┘   └─────┘   └─────┘
  30s       30s      instant   ongoing
```

---

## 🔄 Development Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT CYCLE                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Edit Code    │
                    │  in VS Code   │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Save File    │
                    │  (Ctrl+S)     │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Auto Reload  │
                    │  on Device    │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Test Change  │
                    │  on Device    │
                    └───────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
            ┌──────────────┐  ┌──────────────┐
            │  Works? ✅   │  │  Bug? ❌     │
            │  Ship it!    │  │  Fix & retry │
            └──────────────┘  └──────────────┘
                    │               │
                    │               │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Next Feature │
                    └───────────────┘
```

---

## 🎊 Success Indicators

```
✅ BACKEND RUNNING:
   Terminal shows: "Server running on port 3000"
   Browser shows: {"status":"ok"} at localhost:3000/health

✅ FRONTEND CONNECTED:
   QR code displayed in terminal
   Device shows "Connected to Metro"

✅ APP WORKING:
   Welcome screen appears
   Sign up/in works
   Messages send/receive
   AI suggestions appear

✅ DEVELOPMENT MODE:
   Code changes appear instantly
   No rebuild needed
   Hot reload working
```

---

**Use these flowcharts to quickly understand the startup process and troubleshoot issues!**
