# ngrok Setup Guide - Permanent Solution

## What is ngrok?
ngrok creates a secure tunnel from a public URL to your local server, solving the IP address problem permanently. Your phone can connect from anywhere, even on different networks.

## Step 1: Sign Up for ngrok (Free)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with email or GitHub
3. Verify your email

## Step 2: Get Your Auth Token

1. After login, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl0mnop1qrs_2stu3vwx4yz5ABC6DEF7GHI`)

## Step 3: Install ngrok Auth Token

Run this command in your terminal (replace with YOUR token):

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Example:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl0mnop1qrs_2stu3vwx4yz5ABC6DEF7GHI
```

## Step 4: Start Your Backend Server

```bash
cd backend
npm run dev
```

Keep this terminal running.

## Step 5: Start ngrok Tunnel

Open a NEW terminal and run:

```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

**COPY THE HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

## Step 6: Update Frontend Configuration

The ngrok URL changes each time you restart it (on free plan). We'll make it easy to update.

### Option A: Use Environment Variable (Recommended)

1. Create `frontend/.env`:
```bash
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app/api
```

2. Update `frontend/constants/index.ts` to use it

### Option B: Quick Update (Temporary)

Update `frontend/utils/network.ts`:
```typescript
const NGROK_URL = "https://abc123.ngrok-free.app"; // Update this each time
```

## Step 7: Restart Your App

1. Stop Expo (Ctrl+C)
2. Clear cache: `npx expo start -c`
3. Scan QR code again

## Step 8: Test Connection

Your app should now connect successfully!

---

## Permanent Setup (Paid ngrok - $8/month)

With paid ngrok, you get a static domain that never changes:

1. Upgrade at: https://dashboard.ngrok.com/billing/subscription
2. Get static domain: https://dashboard.ngrok.com/domains
3. Use: `ngrok http --domain=your-static-domain.ngrok-free.app 3000`
4. Set in frontend once, never change again

---

## Alternative: Use Render/Railway (Free)

Deploy your backend to a cloud service for a permanent URL:

### Render (Recommended - Free)
1. Go to: https://render.com
2. Connect GitHub repo
3. Deploy backend
4. Get permanent URL: `https://your-app.onrender.com`

### Railway
1. Go to: https://railway.app
2. Deploy from GitHub
3. Get permanent URL

---

## Troubleshooting

### "authentication failed"
- Run: `ngrok config add-authtoken YOUR_TOKEN`
- Make sure you copied the full token

### "tunnel not found"
- Make sure backend is running on port 3000
- Check: `http://localhost:3000/api/health`

### "ERR_NGROK_4018"
- You need to verify your email
- Check: https://dashboard.ngrok.com/get-started/setup

### ngrok URL changes every restart
- This is normal on free plan
- Upgrade to paid for static domain
- Or deploy to Render/Railway for permanent URL
