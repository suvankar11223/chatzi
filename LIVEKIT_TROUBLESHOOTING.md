# 🔧 LiveKit Connection Troubleshooting

## Current Issue
Both phones show "Connecting..." but never connect to the LiveKit call.

## What I Fixed

### 1. Corrected LiveKit Meet URL Format
Changed from:
```
https://meet.livekit.io/custom?liveKitUrl=...&token=...
```

To the correct format:
```
https://meet.livekit.io/?url=wss://...&token=...
```

### 2. Added Debug Logging
The callScreen now logs:
- Token presence and length
- WebSocket URL
- WebView loading states
- Any errors

## Check These Logs

After clicking the call button, look for these logs:

```
[Call] Call initiated, received token
[CallScreen] Params: { roomName: '...', hasToken: true, tokenLength: XXX, wsUrl: 'wss://...' }
[CallScreen] Meet URL: https://meet.livekit.io/?url=...
[CallScreen] WebView loading...
[CallScreen] WebView loaded
```

## Possible Issues & Solutions

### Issue 1: Invalid Token
**Symptoms**: Stuck on "Connecting..."
**Check**: Look at token length in logs - should be ~200+ characters
**Fix**: Verify LiveKit credentials on Render are correct

### Issue 2: Wrong WebSocket URL
**Symptoms**: Connection timeout
**Check**: wsUrl should be `wss://chatzi-b81wejrw.livekit.cloud`
**Fix**: Verify `LIVEKIT_WS_URL` env var on Render

### Issue 3: Room Name Mismatch
**Symptoms**: Users in different rooms
**Check**: Both users should have same roomName in logs
**Fix**: Already handled - roomName generated once by caller

### Issue 4: LiveKit Cloud Account Issue
**Symptoms**: Valid token but still can't connect
**Check**: Visit https://cloud.livekit.io and verify:
- Account is active
- Project exists
- API keys are valid
**Fix**: May need to regenerate API keys

## Test Steps

1. **Clear app cache and restart**:
   ```bash
   cd frontend
   npx expo start --clear
   ```

2. **Make a call and check logs**:
   - Look for `[CallScreen] Params:` - verify token exists
   - Look for `[CallScreen] Meet URL:` - copy this URL
   - Look for any error messages

3. **Test the Meet URL directly**:
   - Copy the Meet URL from logs
   - Open it in a browser on your computer
   - If it works in browser but not in app, it's a WebView issue
   - If it doesn't work in browser either, it's a token/credentials issue

## Alternative: Test with LiveKit Example Room

To verify your LiveKit account works, try this URL in the app:
```
https://meet.livekit.io/custom?liveKitUrl=wss://chatzi-b81wejrw.livekit.cloud
```

If this works, the issue is with token generation.
If this doesn't work, the issue is with your LiveKit account/credentials.

## Next Steps

1. Restart frontend with `--clear` flag
2. Make a call
3. Share the logs showing:
   - `[CallScreen] Params:`
   - `[CallScreen] Meet URL:`
   - Any error messages

This will help identify exactly where the connection is failing.
