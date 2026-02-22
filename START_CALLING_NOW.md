# 🚀 Start Making Calls NOW!

## Quick 3-Step Setup

### Step 1: Install Agora SDK (2 minutes)

```bash
cd frontend
npx expo install react-native-agora
```

### Step 2: Restart Everything (1 minute)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npx expo start -c
```

### Step 3: Test a Call! (30 seconds)

1. Open app on two devices/emulators
2. Login as different users (tini@test.com and suvankar@test.com)
3. Open a conversation between them
4. Click the phone 📞 or video 📹 icon in the header
5. Accept the call on the other device
6. You're connected! 🎉

## That's It!

Everything else is already implemented:
- ✅ Backend call events
- ✅ Agora integration
- ✅ Call screens (incoming & active)
- ✅ Call buttons in conversation
- ✅ Global call listener
- ✅ Your Agora App ID stored

## Test Accounts

- tini@test.com / password123
- suvankar@test.com / password123
- bdbb@test.com / password123
- krish@test.com / password123

## What You'll See

### Voice Call
- Avatar of the other person
- Call duration timer
- Mute/unmute button
- Speaker toggle
- End call button

### Video Call
- Full screen video of other person
- Small window with your video (top right)
- Camera on/off button
- Flip camera button
- Mute/unmute button
- End call button

## Troubleshooting

**Can't install Agora?**
```bash
cd frontend
npm install react-native-agora
```

**Call not connecting?**
- Check both users are online (green dot)
- Verify backend is running
- Check console logs

**No audio/video?**
- Grant permissions when prompted
- Test on real device (not emulator)
- Check device camera/mic works

## Need Help?

Check `AGORA_SETUP_COMPLETE.md` for detailed documentation.

---

**Ready? Run the install command and start calling!** 📞📹
