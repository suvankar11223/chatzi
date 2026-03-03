# 🚀 Run Build Now - Step by Step

## ⚠️ IMPORTANT: Copy and Paste These Commands ONE AT A TIME

The `>>` symbol in your error means you tried to run multiple lines at once. Run each command separately.

---

## 📍 Step 1: Open PowerShell/Terminal

Open a new PowerShell or Terminal window.

---

## 📂 Step 2: Navigate to Frontend Directory

Copy and paste this command:

```powershell
cd C:\Users\sangh\Downloads\chat-app\frontend
```

Press Enter.

---

## ✅ Step 3: Verify You're in the Right Place

Copy and paste this command:

```powershell
pwd
```

You should see: `C:\Users\sangh\Downloads\chat-app\frontend`

---

## 🔧 Step 4: Configure EAS Build

Copy and paste this command:

```powershell
eas build:configure
```

When prompted:
1. **"Which platforms would you like to configure?"** → Select **"Android"** (use arrow keys, press Enter)
2. It will update your `eas.json` file

---

## 🏗️ Step 5: Build Development Client

Copy and paste this command:

```powershell
eas build --profile development --platform android
```

When prompted:
1. **"Log in to your Expo account"** → Follow the login prompts
2. **"Would you like to automatically create an EAS project?"** → Press **Y** (Yes)
3. **Build will start** → Wait 10-15 minutes

---

## 📱 Step 6: Install on Device

Once the build completes:
1. You'll see a message: **"Build finished"**
2. You'll get a **download link**
3. Open the link on your Android device
4. Download and install the APK
5. Allow installation from unknown sources if prompted

---

## 🎯 Step 7: Start Development Server

After the app is installed on your device, copy and paste this command:

```powershell
npx expo start --dev-client
```

Then:
- Press **`a`** to open on Android device
- Or scan the QR code with the development client app

---

## 🔑 Step 8: Start Backend Server

Open a **NEW** PowerShell/Terminal window and run:

```powershell
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
```

Keep this running.

---

## ✅ You're Done!

The app should now be running on your device with all features working:
- ✅ Voice messages
- ✅ Emoji reactions
- ✅ Pinned messages
- ✅ Google Sign-In (after you add google-services.json)

---

## 🐛 If You Get Errors

### Error: "Not logged in to EAS"

Run this command:
```powershell
eas login
```

Follow the prompts to log in with your Expo account.

### Error: "No Expo account"

1. Go to https://expo.dev
2. Click "Sign Up"
3. Create a free account
4. Then run `eas login`

### Error: "Build failed"

Check the error message. Common issues:
- Missing dependencies → Run `npm install` in frontend folder
- Invalid configuration → Check `app.json` and `eas.json`
- Network issues → Try again

---

## 💡 Pro Tips

1. **Don't close the terminal** while the build is running
2. **Keep backend running** in a separate terminal
3. **Use the same WiFi** for your computer and phone
4. **Check logs** if something doesn't work

---

## 📋 Quick Command Summary

```powershell
# 1. Navigate to frontend
cd C:\Users\sangh\Downloads\chat-app\frontend

# 2. Configure EAS (first time only)
eas build:configure

# 3. Build development client (first time only)
eas build --profile development --platform android

# 4. Start frontend (every time)
npx expo start --dev-client

# 5. Start backend (in new terminal, every time)
cd C:\Users\sangh\Downloads\chat-app\backend
npm start
```

---

## 🆘 Need Help?

If you're stuck:
1. Read the error message carefully
2. Check `BUILD_GUIDE.md` for detailed troubleshooting
3. Make sure you're in the `frontend` directory
4. Try running `npm install` again

---

**Remember**: Run commands ONE AT A TIME, not all together! 🎯

Good luck! 🚀
