# 🚀 Quick Start - ZegoCloud Calling

## ✅ Status: Ready!

- ✅ Zego packages installed
- ✅ Credentials configured (App ID: 625677895)
- ✅ Expo starting with `--clear` flag

---

## 📱 What's Happening Now

Expo is starting your app with ZegoCloud calling enabled. You should see:

1. Metro bundler starting
2. QR code to scan with Expo Go
3. Options to open on Android/iOS

---

## 🎯 Next Steps

### 1. Open the App
- **On Phone:** Open Expo Go app and scan the QR code
- **On Emulator:** Press `a` for Android or `i` for iOS

### 2. Test Calls
1. Open app on 2 devices
2. Log in as different users:
   - Device 1: `tini@test.com` / `password123`
   - Device 2: `suvankar@test.com` / `password123`
3. Open a conversation between them
4. Tap the **phone icon** (voice) or **video icon** (video)
5. Other device shows incoming call screen!

---

## ✨ What You'll See

### In Conversation Screen
- Phone icon (voice call button)
- Video icon (video call button)
- Only visible in direct conversations (not groups)

### When Making a Call
- "Calling..." screen appears
- Outgoing ringtone plays
- Waiting for other user to accept

### When Receiving a Call
- Full-screen incoming call UI
- Ringtone plays
- Shows caller name
- Accept/Reject buttons

### During Call
- Video feed (for video calls)
- Mute button
- Speaker toggle
- Camera flip (front/back)
- End call button

---

## 🐛 Troubleshooting

### "Cannot find module @zegocloud..."
Already fixed! Packages are installed.

### Call buttons not showing
- Only work in direct conversations (1-on-1)
- Not available in group chats
- Check console for "[Zego] Initialized successfully"

### No incoming call screen
- Make sure both users are logged in
- Check internet connection
- Look for errors in console

---

## 💡 Tips

### PowerShell Commands
In PowerShell, use `.\` before script names:
```powershell
.\install-zego.bat      # ✅ Correct
install-zego.bat        # ❌ Won't work
```

### Restart Expo
If you need to restart:
```powershell
# Stop current process (Ctrl+C in terminal)
# Then run:
.\start-with-zego.bat

# Or manually:
cd frontend
npx expo start --clear
```

### Clear Cache
Always use `--clear` flag after:
- Installing new packages
- Changing configuration
- Updating credentials

---

## 📚 Documentation

- **READY_TO_CALL.md** - Quick reference
- **IMPLEMENTATION_COMPLETE.md** - Full details
- **COMPLETE_ZEGO_GUIDE.md** - Comprehensive guide

---

## 🎉 You're All Set!

Your app is starting with ZegoCloud calling enabled. Just:
1. Scan the QR code with Expo Go
2. Log in as a test user
3. Start making calls!

Enjoy your new calling feature! 🚀
