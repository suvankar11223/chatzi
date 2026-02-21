# Quick Solution: Use ngrok for Testing

## What is ngrok?
ngrok creates a secure tunnel to your localhost, giving you a public URL that works from anywhere.

## Setup Steps:

### 1. Install ngrok
- Go to https://ngrok.com/download
- Download and install for Windows
- Sign up for free account
- Run: `ngrok config add-authtoken YOUR_TOKEN`

### 2. Start Your Backend
```bash
cd backend
npm run dev
```

### 3. Start ngrok Tunnel
Open a new terminal:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### 4. Update Frontend Constants
Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update:

**frontend/constants/index.ts:**
```typescript
export const API_URL = "https://abc123.ngrok.io/api";
```

**frontend/socket/socket.ts:**
```typescript
const SOCKET_URL = "https://abc123.ngrok.io";
```

### 5. Rebuild App
```bash
cd frontend
# Shake device -> Reload
```

## Benefits:
✓ Works from anywhere (not just same WiFi)
✓ No IP configuration needed
✓ Friends can use the app immediately
✓ Free for testing

## Limitations:
- URL changes each time you restart ngrok (free tier)
- Need to keep ngrok running
- For permanent solution, deploy to cloud

---

# Production Solution: Deploy to Render.com

## Why Render?
- Free tier available
- Automatic HTTPS
- Easy deployment
- Permanent URL

## Steps:

### 1. Prepare Backend for Deployment

Add to `backend/package.json`:
```json
{
  "scripts": {
    "start": "node index.js",
    "build": "tsc"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Create render.yaml
```yaml
services:
  - type: web
    name: chat-app-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
```

### 3. Deploy to Render
1. Push code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Render will auto-detect settings
6. Add environment variables
7. Click "Create Web Service"

### 4. Get Your URL
After deployment, you'll get a URL like:
`https://chat-app-backend.onrender.com`

### 5. Update Frontend
```typescript
// frontend/constants/index.ts
export const API_URL = "https://chat-app-backend.onrender.com/api";

// frontend/socket/socket.ts
const SOCKET_URL = "https://chat-app-backend.onrender.com";
```

### 6. Rebuild and Test
Now anyone can use your app from anywhere!

---

# Alternative: Railway.app

Similar to Render but sometimes faster:

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Connect your repo
5. Add environment variables
6. Deploy

You'll get a URL like: `https://your-app.up.railway.app`

---

# For Right Now (Quick Test):

Use ngrok - it takes 5 minutes to setup and your friends can test immediately!
