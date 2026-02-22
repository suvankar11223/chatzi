# 🔧 Add LiveKit Environment Variables to Render

## The Problem
Server error on Render because LiveKit credentials are missing from the environment variables.

## Solution: Add Environment Variables

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your backend service: **chatzi-1m0m**
3. Click **"Environment"** in the left sidebar

### Step 2: Add These 3 Variables

Click **"Add Environment Variable"** and add each one:

#### Variable 1:
- **Key**: `LIVEKIT_API_KEY`
- **Value**: `APIowEr7YWy85u6`

#### Variable 2:
- **Key**: `LIVEKIT_API_SECRET`
- **Value**: `e1QEg3kIj4iL2FosYtHguneFESvIZC6oSIdq3kMQbln`

#### Variable 3:
- **Key**: `LIVEKIT_WS_URL`
- **Value**: `wss://chatzi-b81wejrw.livekit.cloud`

### Step 3: Save Changes
1. Click **"Save Changes"** at the bottom
2. Render will automatically redeploy (takes 2-3 minutes)

### Step 4: Verify Deployment
Check the logs for:
```
✓ Build successful
✓ Starting server...
Server listening on port 3000
```

## Alternative: Test Locally First

If you want to test before deploying to Render:

1. **Start local backend**:
   ```bash
   cd backend
   npm start
   ```
   
2. **Update frontend to use local backend temporarily**:
   - Open `frontend/utils/network.ts`
   - Change `PRODUCTION_URL` to your local IP (e.g., `http://192.168.1.x:3000`)
   
3. **Test the call**:
   ```bash
   cd frontend
   npx expo start --clear
   ```

4. **If it works locally**, then deploy to Render with the env vars above

## Why This Happened
The `.env` file in your local backend folder is NOT uploaded to Render (it's in `.gitignore`). You must manually add environment variables in the Render dashboard.

## After Adding Env Vars
Once Render redeploys with the new environment variables, try making a call again. You should see:
```
[Call] Initiating video call
[Call] Call initiated, received token
```

Ready to add those env vars! 🚀
