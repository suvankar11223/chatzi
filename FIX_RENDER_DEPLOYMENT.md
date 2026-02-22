# Fix Render Deployment - Step by Step

## Problem Confirmed

Your Render backend at `https://chatzi-1m0m.onrender.com` is running but:
- ✅ Root endpoint works: "Server is running"
- ❌ All API routes return: "Route not found"
- ❌ Cannot login or fetch contacts

This means Render is running old/broken code.

## Solution: Redeploy to Render

### Step 1: Check Render Dashboard

1. Go to: https://dashboard.render.com
2. Find your service: `chatzi-1m0m` (or similar name)
3. Click on it to open the service details

### Step 2: Verify Environment Variables

Click "Environment" tab and verify these exist:

```
MONGO_URI=mongodb+srv://suvankarnayak861_db_user:od5Pbis8xE5tOlLz@cluster0.hzof93c.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
PORT=3000
STREAM_API_KEY=uv6f7pkru7mh
STREAM_API_SECRET=zjv4ypzewcm4kau7ptuk53p85k3bn4bd4sccpv88r9k8p6294dwmnvydys3jcvam
```

If any are missing, add them and save.

### Step 3: Check Build Settings

Click "Settings" tab and verify:

**Build Command:**
```
cd backend && npm install
```

**Start Command:**
```
cd backend && npm start
```

**Root Directory:** (leave empty or set to `/`)

### Step 4: Manual Redeploy

1. Click "Manual Deploy" button (top right)
2. Select "Deploy latest commit"
3. Wait for deployment to complete (watch the logs)
4. Look for: "✅ Server listening on 0.0.0.0:3000"

### Step 5: Test After Deployment

Run this command:
```bash
node test-production.js
```

Expected output:
```
✅ Root response: Server is running
✅ Health check: { success: true, status: 'ok' }
✅ Login successful
✅ Contacts fetched: 3 users
```

## Alternative: Use Local Backend (Faster for Testing)

If Render is taking too long or having issues, use your local backend:

### Option 1: Local Network (Same WiFi)

1. Find your local IP:
   ```bash
   ipconfig
   # Look for "IPv4 Address" under WiFi adapter
   # Example: 192.168.1.100
   ```

2. Update `frontend/utils/network.ts`:
   ```typescript
   const PRODUCTION_URL = "http://192.168.1.100:3000";
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

### Option 2: Use ngrok (Works from Anywhere)

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

4. Update `frontend/utils/network.ts`:
   ```typescript
   const PRODUCTION_URL = "https://abc123.ngrok-free.app";
   ```

5. Restart Expo:
   ```bash
   cd frontend
   npx expo start -c
   ```

## After Any Change

Always restart Expo with cache clear:
```bash
cd frontend
npx expo start -c
```

Then login with:
- Email: `tini@test.com`
- Password: `password123`

You should see 3 other users in contacts.

## Troubleshooting

### If Render deployment fails:

Check the logs in Render dashboard for errors. Common issues:
- Missing dependencies
- Wrong Node version
- Environment variables not set
- Build command incorrect

### If local backend doesn't work:

1. Make sure backend is running: `cd backend && npm run dev`
2. Check firewall isn't blocking port 3000
3. Verify phone and computer on same WiFi
4. Try ngrok instead

### If contacts still don't load:

1. Check backend logs for errors
2. Verify database has users: `cd backend && npm run check-users`
3. Test API directly: `node test-production.js`
4. Check Expo logs for network errors
