# Chat App Setup Instructions

## Problem: Socket Connection Failing

If you see "Connection issue" or "transport error" in your app, follow these steps:

## Step 1: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
==========================================================
SERVER STARTED SUCCESSFULLY
==========================================================
Server is running on Port 3000
[DEBUG] Auth routes mounted at /api/auth
[DEBUG] User routes mounted at /api/user
[DEBUG] Socket.IO ready for connections
[DEBUG] Server accessible at:
  - http://localhost:3000
  - http://127.0.0.1:3000
  - http://172.25.251.53:3000 (for physical devices on same network)
==========================================================
IMPORTANT: Make sure your phone and computer are on the SAME WiFi network!
==========================================================
```

## Step 2: Verify Your Network

1. Make sure your phone and computer are on the SAME WiFi network
2. Check your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your WiFi adapter

3. Update the IP in `frontend/constants/index.ts` if it changed:
   ```typescript
   const LOCAL_IP = "172.25.251.53"; // e.g., "172.25.251.53"
   ```

## Step 3: Test Backend Connection

From the backend folder, run:
```bash
npm run test-connection
```

This will test if the server is accessible from different addresses.

## Step 4: Restart Your App

1. Stop the Expo app (Ctrl+C in terminal)
2. Clear cache and restart:
   ```bash
   cd frontend
   npx expo start -c
   ```

## Step 5: Login and Check

1. Login to your app
2. You should see the 4 users immediately:
   - Tini (tini@test.com)
   - Suvankar (suvankar@test.com)
   - bdbb (bdbb@test.com)
   - Krish (krish@test.com)

3. If you see "Connection issue", tap the "Retry Connection" button

## Troubleshooting

### Socket keeps disconnecting
- Make sure backend is running (`npm run dev` in backend folder)
- Check that your phone and computer are on the same WiFi
- Verify the IP address in `frontend/constants/index.ts` matches your computer's IP

### No users showing
- Check backend logs for "getContacts" events
- Make sure you ran the seed script: `npm run seed` in backend folder
- Check that socket is connected (should see green checkmark in logs)

### Messages not reaching
- Both users must be logged in
- Both users must have socket connected
- Check backend logs for "newMessage" events

## Database Seeding

To reset the database with only the 4 test users:

```bash
cd backend
npm run seed
```

This will:
1. Delete ALL existing users
2. Create only these 4 users:
   - Tini (tini@test.com) - password: password123
   - Suvankar (suvankar@test.com) - password: password123
   - bdbb (bdbb@test.com) - password: password123
   - Krish (krish@test.com) - password: password123

## Expected Behavior

When everything is working:
1. Login → Socket connects → Navigate to home
2. Home screen shows all 4 users immediately
3. Tap any user → Start chatting
4. Messages appear instantly for both users
5. Home screen updates with last message

## Debug Logs

Look for these in your terminal:

**Frontend (Expo):**
```
[DEBUG] Socket: ✓ Connected successfully
[DEBUG] Socket ID: abc123
[DEBUG] Socket transport: websocket
[DEBUG] Home: Loaded 3 contacts via socket
[DEBUG] Contact names: Tini, bdbb, Krish
```

**Backend:**
```
[DEBUG] Socket: User authenticated: tini@test.com
[DEBUG] Socket: User connected - tini@test.com (socket_id)
[DEBUG] Socket: Sent 3 contacts to user user_id
```

If you don't see these logs, the socket is not connecting properly.
