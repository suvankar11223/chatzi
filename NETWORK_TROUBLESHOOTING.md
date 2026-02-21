# Network Troubleshooting Guide

## Error: "Network request failed"

This error means your phone can't reach the backend server. Here's how to fix it:

## Quick Fixes

### Fix 1: Wake Up the Backend (Most Common)
The Render free tier sleeps after 15 minutes of inactivity.

**Solution:**
1. Open your browser on your phone
2. Visit: https://chatzi-1m0m.onrender.com
3. Wait 30-60 seconds for it to wake up
4. You should see "Server is running"
5. Go back to the app and reload (shake phone → Reload)

### Fix 2: Check Internet Connection
**Solution:**
1. Make sure your phone has internet (WiFi or mobile data)
2. Try opening a website in your browser
3. If internet works, try Fix 1 again

### Fix 3: Clear App Cache
**Solution:**
1. Close Expo Go completely
2. Reopen Expo Go
3. Shake phone → "Reload"
4. Try again

### Fix 4: Wait for Backend to Respond
Sometimes the backend is slow to respond.

**Solution:**
1. Wait 60 seconds after opening the app
2. Pull down to refresh on the home screen
3. The app will retry automatically

## Understanding the Errors

### "xhr poll error"
- This means the socket connection is trying to connect
- It will keep retrying automatically
- Usually resolves after 30-60 seconds

### "Network request failed"
- This means the HTTP request to fetch contacts failed
- The app will retry 3 times automatically
- Each retry waits longer (1s, 2s, 4s)

## What the App Does Automatically

The app now has smart retry logic:

1. **API Requests**: Retries 3 times with exponential backoff
   - Attempt 1: Immediate
   - Attempt 2: Wait 1 second
   - Attempt 3: Wait 2 seconds

2. **Socket Connection**: Retries 5 times
   - Waits 500ms between attempts
   - Max wait: 3 seconds

3. **Timeout**: 15 seconds per request
   - If backend doesn't respond in 15s, it retries

## Testing Backend Connectivity

### From Your Phone:
1. Open browser on your phone
2. Visit: https://chatzi-1m0m.onrender.com
3. Should see: "Server is running"
4. If you see this, backend is working

### From Your Computer:
```bash
curl https://chatzi-1m0m.onrender.com
```
Should return: "Server is running"

## Common Scenarios

### Scenario 1: First Time Opening App
**What happens:**
- Backend is sleeping on Render
- First request wakes it up (takes 30-60 seconds)
- Subsequent requests are fast

**Solution:**
- Wait 60 seconds
- Pull down to refresh
- Contacts will load

### Scenario 2: App Was Closed for a While
**What happens:**
- Backend went to sleep
- Socket connection fails
- API requests fail

**Solution:**
- Wake up backend (visit URL in browser)
- Wait 60 seconds
- Reload app

### Scenario 3: Poor Internet Connection
**What happens:**
- Requests timeout
- Socket keeps disconnecting

**Solution:**
- Switch to better WiFi or mobile data
- Wait for connection to stabilize
- App will reconnect automatically

## Logs to Look For

### Good Logs (Working):
```
[DEBUG] ✓ Successfully fetched X contacts from API
[DEBUG] Socket: ✓ Connected successfully
[DEBUG] AuthContext: Socket connected successfully
```

### Bad Logs (Not Working):
```
[DEBUG] ✗ Error fetching contacts from API: Network request failed
[DEBUG] Socket: Connection error: xhr poll error
[DEBUG] All retry attempts failed
```

## Advanced Troubleshooting

### Check Backend Status:
1. Go to https://dashboard.render.com
2. Login with your account
3. Click on "chatzi" service
4. Check if it says "Live" (green)
5. If it says "Sleeping", click to wake it up

### Check Backend Logs:
1. On Render dashboard
2. Click "Logs" tab
3. Look for errors
4. Should see: "Server is running on port 3000"

### Test API Endpoint:
Use a tool like Postman or curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://chatzi-1m0m.onrender.com/api/user/contacts
```

## Prevention Tips

### Keep Backend Awake:
The free tier sleeps after 15 minutes. To keep it awake:
1. Use the app regularly
2. Or upgrade to paid tier on Render ($7/month)
3. Or use a service like UptimeRobot to ping it every 5 minutes

### Better Connection:
1. Use stable WiFi
2. Avoid switching between WiFi and mobile data
3. Close other apps using internet

## Still Not Working?

If none of these fixes work:

1. **Check if backend is deployed:**
   - Visit https://chatzi-1m0m.onrender.com
   - Should see "Server is running"

2. **Check if you're logged in:**
   - Logout and login again
   - This refreshes your authentication token

3. **Check app version:**
   - Make sure you have the latest code
   - Shake phone → Reload

4. **Check backend logs:**
   - Look for errors on Render dashboard
   - Share logs if you need help

## Contact Loading Flow

Here's what happens when you open the app:

1. **Login** → Get authentication token
2. **Connect Socket** → Establish real-time connection
3. **Fetch Contacts** → Get list of users from API
4. **Display** → Show contacts on home screen

If any step fails, you'll see errors. The app will retry automatically.

## Expected Behavior

### First Open (Backend Sleeping):
- Takes 30-60 seconds to load
- You'll see "Connection issue" message
- Wait, then pull down to refresh
- Contacts will appear

### Subsequent Opens (Backend Awake):
- Loads in 2-3 seconds
- Contacts appear immediately
- Socket connects quickly

## Summary

Most "Network request failed" errors are caused by:
1. Backend sleeping on Render (most common)
2. Poor internet connection
3. First request timeout

**Quick Fix:** Visit https://chatzi-1m0m.onrender.com in browser, wait 60 seconds, reload app.
