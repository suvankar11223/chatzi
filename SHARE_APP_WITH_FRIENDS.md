# How to Share Your App with Friends

## Current Situation
- Your app is configured to use: `https://polite-pets-win.loca.lt`
- Your friend has an old version with the wrong URL
- They need the updated version

## Quick Solution: Use Expo Tunnel

### Step 1: Start Expo with Tunnel
In your frontend folder, run:
```bash
npx expo start --tunnel
```

### Step 2: Share the QR Code
- You'll see a QR code in the terminal
- Take a screenshot
- Send it to your friend via WhatsApp/Telegram/etc.

### Step 3: Friend Scans QR Code
- Your friend opens Expo Go app
- Taps "Scan QR Code"
- Scans your QR code
- App opens with the correct URL!

## Important Notes

### Keep These Running:
1. **Backend**: `npm run dev` (in backend folder)
2. **Tunnel**: `lt --port 3000` (in backend folder)  
3. **Expo**: `npx expo start --tunnel` (in frontend folder)

### When Tunnel URL Changes:
The localtunnel URL changes every time you restart it. When this happens:

1. Note the new URL (e.g., `https://new-url.loca.lt`)
2. Update these 2 files:
   - `frontend/constants/index.ts` (4 places)
   - `frontend/socket/socket.ts` (1 place)
3. Restart Expo and share new QR code

## Better Solution: Deploy to Cloud

To avoid constantly updating URLs, deploy your backend to a cloud service:

### Recommended: Render.com (Free)

1. Push your code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Add environment variables (MongoDB URI, JWT secret, etc.)
6. Deploy!

You'll get a permanent URL like: `https://your-app.onrender.com`

Then update the frontend once with this permanent URL and you're done!

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Current URLs (as of now):
- **Tunnel URL**: https://polite-pets-win.loca.lt
- **Backend**: Running on your computer
- **Expo**: Use tunnel mode to share

## Troubleshooting

### Friend sees "Sign up error"
- They have old version with wrong URL
- Share new QR code via Expo tunnel

### "Tunnel Unavailable"
- Tunnel disconnected
- Restart: `lt --port 3000`
- Update URLs in code
- Share new QR code

### "Network request failed"
- Make sure all 3 processes are running (backend, tunnel, expo)
- Check backend logs for errors
- Verify tunnel URL is correct in code
