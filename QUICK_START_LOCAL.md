# ⚡ QUICK START - Local Backend

## 🎯 Fastest Way to Get Running

### Option 1: Use the Batch File (Easiest)

Just double-click: `start-local.bat`

This will:
- Start backend server in one window
- Start Expo in another window
- Everything configured automatically

### Option 2: Manual Start (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Expo:**
```bash
cd frontend
npx expo start -c
```

## 📱 Login

Open the app and login with:
- Email: `tini@test.com`
- Password: `password123`

You'll see 3 contacts: Suvankar, bdbb, Krish

## ✅ What's Configured

- ✅ Local backend: `http://172.25.255.16:3000`
- ✅ Database seeded with 4 test users
- ✅ No Render deployment needed
- ✅ No ngrok needed
- ✅ Works on same WiFi network

## 🔍 Verify It's Working

Before starting Expo, check backend:
```bash
curl http://172.25.255.16:3000/api/health
```

Should return: `{ "success": true, "status": "ok" }`

## ⚠️ Requirements

1. Phone and computer on SAME WiFi
2. Backend must be running first
3. Port 3000 must be available
4. Windows Firewall may need to allow Node.js

## 🆘 Troubleshooting

**"Network request failed":**
- Check both devices on same WiFi
- Verify backend is running
- Try disabling Windows Firewall temporarily

**"No contacts found":**
- Check backend logs for errors
- Reseed database: `cd backend && npm run seed`
- Restart Expo with `-c` flag

**Backend won't start:**
- Port 3000 might be in use
- Check: `netstat -ano | findstr :3000`
- Kill process and try again

## 📚 More Help

- Full guide: `START_LOCAL.md`
- Render deployment: `FIX_RENDER_DEPLOYMENT.md`
- General help: `START_HERE_NOW.md`

---

**You're all set!** Just run `start-local.bat` and login.
