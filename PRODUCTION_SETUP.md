# Production Setup Guide

## Current Status

✅ Frontend configured to use: `https://chatzi-1m0m.onrender.com`
✅ Local database seeded with 4 test users
❌ Production backend needs configuration

## Issue

Your Render backend is running but:
- `/api/health` returns "Route not found" (should return `{ success: true }`)
- Login fails with "Invalid credentials"

This means either:
1. Render is using old code (needs redeploy)
2. Render has different environment variables
3. Render is connected to a different/empty database

## Solution: Check Render Configuration

### Step 1: Verify Render Environment Variables

Go to your Render dashboard → Your service → Environment

Make sure these are set:
```
MONGO_URI=mongodb+srv://suvankarnayak861_db_user:od5Pbis8xE5tOlLz@cluster0.hzof93c.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
PORT=3000
STREAM_API_KEY=uv6f7pkru7mh
STREAM_API_SECRET=zjv4ypzewcm4kau7ptuk53p85k3bn4bd4sccpv88r9k8p6294dwmnvydys3jcvam
```

### Step 2: Trigger Render Redeploy

1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete (check logs)

### Step 3: Verify Deployment

After redeployment, test again:
```bash
node test-production.js
```

You should see:
```
✅ Health check: { success: true, status: 'ok' }
✅ Login successful
✅ Contacts fetched: 3 users
```

## Alternative: Use Local Backend

If Render continues to have issues, you can use your local backend:

### Option A: Use ngrok (Temporary)

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the https URL and update frontend/utils/network.ts
```

### Option B: Use Local Network IP (Same WiFi)

1. Find your local IP:
   ```bash
   ipconfig
   # Look for "IPv4 Address" under your WiFi adapter
   ```

2. Update `frontend/utils/network.ts`:
   ```typescript
   const PRODUCTION_URL = "http://YOUR_LOCAL_IP:3000";
   ```

3. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

4. Restart Expo:
   ```bash
   cd frontend
   npx expo start -c
   ```

## Testing After Setup

1. Clear Expo cache and restart:
   ```bash
   cd frontend
   npx expo start -c
   ```

2. Login with test account:
   - Email: `tini@test.com`
   - Password: `password123`

3. You should see 3 other users in contacts

## Current Configuration

Your app is configured to use:
- Production URL: `https://chatzi-1m0m.onrender.com`
- No ngrok (removed)
- Direct connection to Render backend

Files updated:
- ✅ `frontend/utils/network.ts` - Using production URL only
- ✅ `frontend/services/apiService.ts` - Clean API service created
- ✅ `frontend/hooks/useContacts.ts` - Contacts hook created
- ✅ Database seeded with 4 test users
