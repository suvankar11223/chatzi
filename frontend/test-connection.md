# Testing Backend Connection from Physical Device

## Your Configuration
- **Computer IP**: 172.25.251.53
- **Backend Port**: 3000
- **API URL**: http://172.25.251.53:3000/api

## Steps to Test

### 1. Verify Same Network
Make sure your phone and computer are connected to the **SAME WiFi network**.

### 2. Test from Phone Browser
Open your phone's web browser (Chrome, Safari, etc.) and visit:
```
http://172.25.251.53:3000
```

You should see: **"Server is running"**

If you see this, the connection works! ✅

If you get an error, check:
- Are you on the same WiFi network?
- Is Windows Firewall blocking port 3000?
- Is the backend server running?

### 3. Restart Expo App
After confirming the browser test works:
1. Close the Expo Go app completely
2. Restart it by scanning the QR code again
3. Try registering a new user

### 4. Check Console Logs
In your terminal where Expo is running, you should see:
```
[DEBUG] API Configuration for Physical Device (Expo Go)
[DEBUG] API_URL: http://172.25.251.53:3000/api
```

### 5. Windows Firewall (If Needed)
If the browser test fails, you may need to allow port 3000 through Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter "3000" → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Node.js Port 3000" → Finish

## Troubleshooting

### Error: "Network Error"
- Phone and computer not on same WiFi
- Windows Firewall blocking port 3000
- Backend server not running

### Error: "Request timeout"
- Backend server is slow or not responding
- Network connection is unstable

### Error: "Cannot connect to server"
- Wrong IP address
- Backend not listening on 0.0.0.0 (should be fixed now)
- Port 3000 is blocked

## Current Backend Status
Backend is running and accessible at:
- http://localhost:3000 ✅
- http://127.0.0.1:3000 ✅
- http://172.25.251.53:3000 ✅ (for your phone)
