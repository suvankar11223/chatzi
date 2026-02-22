# 🚀 Start Local Backend - Quick Guide

## ✅ Configuration Done

Your app is now configured to use local backend at: `http://172.25.255.16:3000`

## 📋 Steps to Run

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Wait until you see:
```
✅ Server listening on 0.0.0.0:3000
📱 Access from:
   Network: http://172.25.255.16:3000
```

### Step 2: Start Expo (Terminal 2)

```bash
cd frontend
npx expo start -c
```

The `-c` flag clears the cache (important!)

### Step 3: Login

Open the app on your phone and login with:
- Email: `tini@test.com`
- Password: `password123`

You should see 3 other users:
- Suvankar
- bdbb
- Krish

## ✅ Test Users

All use password: `password123`
- tini@test.com
- suvankar@test.com
- bdbb@test.com
- krish@test.com

## 🔍 Verify Backend is Working

Before starting Expo, test the backend:

```bash
# Test health endpoint
curl http://172.25.255.16:3000/api/health

# Or use the test script
node test-production.js
```

## ⚠️ Important Notes

1. **Same WiFi Required**: Your phone and computer must be on the same WiFi network
2. **Firewall**: Make sure Windows Firewall allows port 3000
3. **Backend First**: Always start backend before Expo
4. **Cache Clear**: Always use `npx expo start -c` after config changes

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed (replace PID)
taskkill /PID <PID> /F
```

### Can't connect from phone:
1. Verify both on same WiFi
2. Check IP is correct: `ipconfig`
3. Test from browser: `http://172.25.255.16:3000`
4. Disable Windows Firewall temporarily to test

### Contacts not loading:
1. Check backend logs for errors
2. Verify database has users: `cd backend && npm run check-users`
3. Clear Expo cache: `npx expo start -c`
4. Check phone logs in Expo

## 🎯 Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start Expo with cache clear
cd frontend && npx expo start -c

# Check database users
cd backend && npm run check-users

# Reseed database
cd backend && npm run seed
```

## 🔄 Switch Back to Render Later

When Render is fixed, update `frontend/utils/network.ts`:
```typescript
const PRODUCTION_URL = "https://chatzi-1m0m.onrender.com";
```

Then restart Expo: `cd frontend && npx expo start -c`
