# Quick Connection Check

## Step 1: Check Backend
```bash
cd backend
npm run dev
```

Wait for: `SERVER STARTED SUCCESSFULLY`

## Step 2: Check Your IP
```bash
ipconfig
```

Find your WiFi adapter's IPv4 Address (e.g., 172.25.251.53)

## Step 3: Test in Browser

On your phone's browser, open:
```
http://172.25.251.53:3000
```

**Should see:** "Server is running"

## Step 4: If IP Changed

Edit `frontend/constants/index.ts`:
```typescript
const LOCAL_IP = "YOUR_NEW_IP"; // Change this line
```

Then restart Expo:
```bash
npx expo start --clear
```

## Current Configuration

- **Backend URL:** `http://172.25.251.53:3000`
- **API URL:** `http://172.25.251.53:3000/api`
- **Socket URL:** `http://172.25.251.53:3000`

All three use the same IP address!
