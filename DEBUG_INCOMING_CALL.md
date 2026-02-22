# 🔍 Debug Incoming Call Issue

## Check These Things:

### 1. Is Backend Deployed?
- Go to https://dashboard.render.com
- Check if latest commit is deployed
- Look for: `feat: modern WebRTC call UI with DM Sans font`

### 2. Check Console Logs on Caller's Phone
When you click the video button, you should see:
```
[Call Debug] rawType: direct isDirect: true otherUserId: 699b...
[Call] Initiating video call, room: chatzi-...
[Call] Navigating to callScreen
```

### 3. Check Console Logs on Receiver's Phone
You should see:
```
[IncomingCall] Received: { callId: '...', callerId: '...', roomId: '...', ... }
```

If you DON'T see this, the socket event is not reaching the receiver.

### 4. Check Backend Logs on Render
Look for:
```
[Call] Sending incomingCall to receiver: 699b...
[WebRTC] user123 joined room chatzi-...
```

## Common Issues:

### Issue 1: Receiver Not Online
- Check if receiver has green dot (online status)
- If offline, they won't receive the call

### Issue 2: Socket Not Connected
- Receiver's socket might be disconnected
- Try restarting the receiver's app

### Issue 3: Backend Not Deployed
- Changes not pushed to Render
- Deploy manually: "Clear build cache & deploy"

### Issue 4: Route Path Wrong
- Should be `/incomingCall` not `/(main)/incomingCall`
- Already fixed in `_layout.tsx`

## Quick Test:

1. **On Receiver's Phone**: Open console and run:
   ```javascript
   // Check if socket is connected
   console.log('Socket connected:', getSocket()?.connected);
   ```

2. **Make a call** from other phone

3. **Check receiver's console** for `[IncomingCall] Received:`

## If Still Not Working:

Add this temporary debug code to `frontend/app/_layout.tsx`:

```typescript
useEffect(() => {
  const socket = getSocket();
  console.log('[Debug] Socket exists:', !!socket);
  console.log('[Debug] User ID:', user?.id);
  
  if (!socket || !user?.id) {
    console.log('[Debug] Not setting up incoming call listener');
    return;
  }
  
  console.log('[Debug] Setting up incoming call listener');
  
  const handleIncomingCall = (data: any) => {
    console.log('[IncomingCall] Received:', data);
    console.log('[IncomingCall] Navigating to /incomingCall');
    // ... rest of code
  };
  
  socket.on('incomingCall', handleIncomingCall);
  return () => { socket.off('incomingCall', handleIncomingCall); };
}, [user?.id, router]);
```

This will show exactly where the issue is!
