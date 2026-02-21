# Connection Troubleshooting Guide

## Current Issue
Socket trying to connect to: `http://172.25.251.53:3000`
Error: `websocket error` - Cannot connect to backend

## Quick Fixes

### 1. Check if Backend is Running

Open a terminal in the backend folder and run:
```bash
cd backend
npm run dev
```

You should see:
```
============================================================
SERVER STARTED SUCCESSFULLY
============================================================
Server is running on Port 3000
```

If you see errors, the backend isn't running properly.

### 2. Verify Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (usually starts with 192.168.x.x or 172.x.x.x)

**On Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your WiFi interface

**Current IP in app:** `172.25.251.53`

If your IP is different, update `frontend/constants/index.ts`:
```typescript
const LOCAL_IP = "YOUR_NEW_IP_HERE";
```

### 3. Check Same WiFi Network

Both your phone and computer MUST be on the same WiFi network.

**On Phone:**
- Settings → WiFi → Check network name

**On Computer:**
- Check WiFi settings → Note network name

They must match exactly!

### 4. Test Backend Connection

Open your phone's browser and go to:
```
http://172.25.251.53:3000
```

**If it works:** You should see "Server is running"
**If it doesn't work:** Network issue - check WiFi or firewall

### 5. Check Firewall

Windows Firewall might be blocking the connection.

**Allow Node.js through firewall:**
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find "Node.js" and check both Private and Public
4. If not listed, click "Allow another app" and add Node.js

### 6. Restart Everything

If nothing works:
1. Stop backend (Ctrl+C)
2. Close Expo on phone
3. Restart backend: `npm run dev`
4. Restart Expo: `npx expo start --clear`
5. Scan QR code again

## Common Issues

### "websocket error"
- Backend not running
- Wrong IP address
- Firewall blocking connection
- Not on same WiFi

### "Network request failed"
- Phone can't reach computer
- Different WiFi networks
- VPN interfering

### "Connection timeout"
- Backend is slow to start
- Network congestion
- Just wait, it will retry

## Quick Test

1. **Backend running?** Check terminal for "SERVER STARTED SUCCESSFULLY"
2. **IP correct?** Run `ipconfig` and compare
3. **Same WiFi?** Check both devices
4. **Browser test?** Open `http://172.25.251.53:3000` on phone's browser

If all 4 are YES, the app should connect within 10 seconds.

## Still Not Working?

1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `frontend/constants/index.ts` with the correct IP
3. Restart Expo: `npx expo start --clear`
4. Make sure backend is running: `npm run dev` in backend folder
5. Scan QR code again

The socket will keep retrying automatically, so once everything is correct, it will connect!
