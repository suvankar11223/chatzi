# Quick Start with ngrok (5 Minutes Setup)

## Step 1: Download ngrok
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract the zip file
4. Sign up at https://dashboard.ngrok.com/signup
5. Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

## Step 2: Setup ngrok
Open PowerShell in the ngrok folder and run:
```powershell
.\ngrok config add-authtoken YOUR_TOKEN_HERE
```

## Step 3: Start Backend
Open terminal in your project:
```bash
cd backend
npm run dev
```
Keep this running!

## Step 4: Start ngrok
Open NEW terminal in ngrok folder:
```powershell
.\ngrok http 3000
```

You'll see something like:
```
Forwarding  https://1234-abc-def.ngrok-free.app -> http://localhost:3000
```

**COPY THIS URL!** (the https one)

## Step 5: Update Frontend

Open `frontend/constants/index.ts` and change:
```typescript
export const API_URL = "https://YOUR-NGROK-URL.ngrok-free.app/api";
```

Open `frontend/socket/socket.ts` and change:
```typescript
const SOCKET_URL = "https://YOUR-NGROK-URL.ngrok-free.app";
```

## Step 6: Reload App
On your phone:
- Shake device
- Tap "Reload"

## Done! 🎉
Now your friends can use the app from anywhere! Just share the app with them.

## Important Notes:
- Keep both terminals running (backend + ngrok)
- The ngrok URL changes when you restart ngrok (free tier)
- For permanent URL, deploy to Render.com (see DEPLOYMENT_GUIDE.md)
- ngrok free tier has a visitor limit, but fine for testing with friends

## Troubleshooting:
If connection fails:
1. Make sure backend is running (terminal 1)
2. Make sure ngrok is running (terminal 2)
3. Check you copied the HTTPS url (not http)
4. Make sure you updated BOTH files (constants/index.ts and socket/socket.ts)
5. Reload the app on phone
