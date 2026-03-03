# ✅ Google Sign-In Setup Checklist

## 🎯 Your SHA1 Fingerprint
```
CB:AF:72:08:00:6B:EE:31:20:82:6B:63:DA:E3:D6:04:DF:98:50:6D
```

## 📋 Current Status

### ✅ Already Done
- [x] Firebase project created: **bubbles-b2e10-5b9ce**
- [x] Android app registered: **com.chatzi.app**
- [x] SHA1 fingerprint obtained
- [x] `app.json` configured with `googleServicesFile`
- [x] Google Sign-In packages installed
- [x] Code implementation complete

### ⏳ Need to Do Now

- [ ] **Step 1**: Add SHA1 to Firebase Console
- [ ] **Step 2**: Re-download google-services.json
- [ ] **Step 3**: Replace file in project
- [ ] **Step 4**: Verify OAuth client exists
- [ ] **Step 5**: Enable Google Sign-In in Firebase Authentication
- [ ] **Step 6**: Build and test

---

## 🔥 STEP 1: Add SHA1 to Firebase Console

1. Go to: https://console.firebase.google.com
2. Select project: **bubbles-b2e10-5b9ce**
3. Click **⚙️ gear icon** (top left) → **Project settings**
4. Scroll to **"Your apps"** section
5. Find: **com.chatzi.app** (Android app)
6. Scroll to **"SHA certificate fingerprints"**
7. Click **"Add fingerprint"**
8. Paste this SHA1:
   ```
   CB:AF:72:08:00:6B:EE:31:20:82:6B:63:DA:E3:D6:04:DF:98:50:6D
   ```
9. Click **"Save"**

---

## 📥 STEP 2: Re-download google-services.json

**Why?** The SHA1 was just added. The new file will contain the Android OAuth client.

1. **Same page** in Firebase Console (Project Settings)
2. Scroll down to your Android app: **com.chatzi.app**
3. Click the **📥 google-services.json** button
4. Save the downloaded file

---

## 📂 STEP 3: Replace File in Project

1. Navigate to: `C:\Users\sangh\Downloads\chat-app\frontend\`
2. **Delete** the old `google-services.json`
3. **Paste** the newly downloaded `google-services.json`

Your project structure should look like:
```
frontend/
├── app.json
├── google-services.json    ← NEW FILE HERE
├── package.json
├── .env
└── app/
```

---

## ✅ STEP 4: Verify OAuth Client Exists

Run this command to check:

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
cat google-services.json | grep "client_type"
```

**Expected output (GOOD):**
```json
"client_type": 1    ← Android client (added by SHA1)
"client_type": 3    ← Web client
```

**Bad output (means wrong file):**
```json
"client_type": 3    ← Only web client (missing Android)
```

Or check manually - open `google-services.json` and look for:
```json
{
  "oauth_client": [
    {
      "client_id": "xxx-xxx.apps.googleusercontent.com",
      "client_type": 1,
      "android_info": {
        "package_name": "com.chatzi.app",
        "certificate_hash": "cbaf720800..."  ← Should exist now
      }
    }
  ]
}
```

---

## 🔐 STEP 5: Enable Google Sign-In in Firebase Authentication

1. Firebase Console → Left sidebar → **Authentication**
2. Click **"Get started"** (if first time)
3. Click **"Sign-in method"** tab
4. Find **"Google"** in the providers list
5. Click on it
6. Toggle **ENABLE** → ON
7. **Support email** → Select your Gmail
8. Click **"Save"**

---

## 🏗️ STEP 6: Build and Test

### Build the App

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
eas build --profile development --platform android
```

This will take 10-15 minutes.

### After Build Completes

1. **Download APK** from the EAS dashboard link
2. **Install on Android device**
3. **Open app**
4. **Tap "Continue with Google"**
5. **Select your Google account**
6. Should successfully sign in! 🎉

---

## 🐛 Troubleshooting

### Issue: "oauth_client" is still empty after re-download

**Solution**: 
1. Make sure you clicked "Save" after adding SHA1
2. Wait 1-2 minutes for Firebase to process
3. Try downloading again

### Issue: Google Sign-In shows error "Developer Error"

**Causes**:
- SHA1 not added to Firebase
- Wrong google-services.json file
- OAuth client missing

**Solution**: Verify Steps 1-4 above

### Issue: Build fails with "google-services.json not found"

**Solution**: Make sure file is in `frontend/` folder, not root

---

## 📊 Your Current google-services.json Status

**Current file has:**
```json
"oauth_client": []  ← EMPTY (needs update)
```

**After re-download should have:**
```json
"oauth_client": [
  {
    "client_id": "xxx.apps.googleusercontent.com",
    "client_type": 1,
    "android_info": {
      "package_name": "com.chatzi.app",
      "certificate_hash": "cbaf720800..."
    }
  }
]
```

---

## 🎯 Quick Action Plan

**Do these 5 things in order:**

1. ✅ Add SHA1 to Firebase (5 minutes)
2. ✅ Re-download google-services.json (1 minute)
3. ✅ Replace file in project (1 minute)
4. ✅ Enable Google Sign-In in Authentication (2 minutes)
5. ✅ Run `eas build` (15 minutes)

**Total time: ~25 minutes**

---

## 📞 After You Complete Steps 1-4

Come back and run:

```bash
cd C:\Users\sangh\Downloads\chat-app\frontend
eas build --profile development --platform android
```

Then you'll have a working Google Sign-In! 🚀

---

## 🔑 Important Notes

- **Don't skip re-downloading** - the old file won't work
- **Verify the OAuth client** - check the file has `client_type: 1`
- **Enable in Authentication** - Google Sign-In must be enabled
- **Use development profile** - for testing with debugging tools

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ google-services.json has `oauth_client` with `client_type: 1`
- ✅ Firebase Authentication shows Google as "Enabled"
- ✅ Build completes without errors
- ✅ App shows Google account picker when tapping button
- ✅ Successfully signs in and navigates to home screen

Good luck! 🎉
