# 🚀 Deploy LiveKit Backend to Render

## What Changed

The backend now generates LiveKit tokens for both caller and receiver when a call is initiated. This eliminates the 500 error you were seeing.

## Changes Made

### Backend
- ✅ `backend/socket/callEvents.ts`: Now generates tokens for BOTH users in the socket event
- ✅ No separate API endpoint needed - everything happens via socket
- ✅ Better error handling with configuration checks

### Frontend  
- ✅ `frontend/app/(main)/conversation.tsx`: Removed axios call, receives token from socket
- ✅ Simpler flow - just emit socket event and receive token back

## Deploy to Render

### Option 1: Auto-Deploy (If Connected to GitHub)
1. Commit and push changes:
   ```bash
   git add .
   git commit -m "Add LiveKit calling with socket-based tokens"
   git push
   ```
2. Render will auto-deploy (takes 2-3 minutes)
3. Check logs at: https://dashboard.render.com

### Option 2: Manual Deploy
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

## Verify Deployment

After deployment completes, check the logs for:
```
[Network] Configuration
[Network] Platform: ...
[Network] Production URL: https://chatzi-1m0m.onrender.com
```

## Test Locally First (Recommended)

Before deploying, test locally:

1. **Start backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend**:
   ```bash
   cd frontend
   npx expo start --clear
   ```

3. **Test call**:
   - Open app on phone
   - Start conversation
   - Click video/voice button
   - Check console for: `[Call] Call initiated, received token`

## What Happens Now

1. User clicks call button
2. Frontend emits `initiateCall` socket event
3. Backend generates TWO LiveKit tokens (caller + receiver)
4. Backend sends `callInitiated` to caller with their token
5. Backend sends `incomingCall` to receiver with their token
6. Both users navigate to callScreen with their tokens
7. Instant connection via LiveKit Meet!

## Troubleshooting

### If calls still fail after deploy:
1. Check Render logs for errors
2. Verify LiveKit credentials in Render environment variables:
   - `LIVEKIT_API_KEY=APIowEr7YWy85u6`
   - `LIVEKIT_API_SECRET=e1QEg3kIj4iL2FosYtHguneFESvIZC6oSIdq3kMQbln`
   - `LIVEKIT_WS_URL=wss://chatzi-b81wejrw.livekit.cloud`

### If "User is offline" error:
- Both users must be connected to socket
- Check online status indicator (green dot)

### If "Call service not configured" error:
- LiveKit env vars missing on Render
- Add them in Render dashboard → Environment

Ready to deploy! 🎉
