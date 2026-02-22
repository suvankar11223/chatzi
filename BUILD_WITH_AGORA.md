# Build Development Client with Agora Support

## Step-by-Step Guide

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

If you don't have an Expo account:
- Go to https://expo.dev/signup
- Create a free account
- Then run `eas login` and enter your credentials

### Step 3: Configure EAS Build

```bash
cd frontend
eas build:configure
```

This will:
- Create `eas.json` configuration file
- Ask you to choose Android, iOS, or both
- Choose **Android** for now (easier to test)

### Step 4: Update app.json

The `app.json` needs to have proper configuration. I'll create the updated version.

### Step 5: Create Development Build

```bash
# For Android
eas build --profile development --platform android

# This will:
# - Upload your code to Expo servers
# - Build a custom APK with Agora native modules
# - Take about 10-20 minutes
# - Give you a download link when done
```

### Step 6: Install the APK

1. When build completes, you'll get a download link
2. Download the APK to your Android device
3. Install it (you may need to allow "Install from unknown sources")
4. The app icon will say "chat-app (dev)"

### Step 7: Run Development Server

```bash
cd frontend
npx expo start --dev-client
```

Then:
1. Open the development build app on your device
2. Scan the QR code or enter the URL
3. Your app will load with Agora support!

## Important Notes

- **First build takes 10-20 minutes** (subsequent builds are faster)
- **You need an Expo account** (free tier is fine)
- **Development build is different from Expo Go** (it's a custom app)
- **You only need to rebuild when adding new native modules**
- **Code changes hot-reload without rebuilding**

## Troubleshooting

### Build fails with "No Expo account"
- Run `eas login` and sign in
- Make sure you're logged in: `eas whoami`

### Build fails with "Invalid project"
- Make sure you're in the `frontend` folder
- Check that `app.json` exists and is valid

### Can't install APK on device
- Enable "Install from unknown sources" in Android settings
- Try downloading directly to device instead of computer

### Build takes too long
- First build is always slow (10-20 min)
- Subsequent builds are faster (5-10 min)
- You can close terminal and check status later: `eas build:list`

## What's Next?

After successful build and installation:
1. Open the development build app
2. Scan QR code from `npx expo start --dev-client`
3. Test voice and video calls!
4. Code changes will hot-reload without rebuilding

## Cost

- **Free tier**: 30 builds per month
- **More than enough for development**
- No credit card required

---

Ready to start? Run the commands in order!
