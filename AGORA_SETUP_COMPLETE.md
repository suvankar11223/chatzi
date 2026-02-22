# Agora Voice/Video Call Implementation - COMPLETE ✅

## What Was Implemented

### ✅ Backend Changes
1. **Call Model Updated** (`backend/modals/Call.ts`)
   - Changed from WebRTC to Agora structure
   - Added `agoraChannel` field
   - Updated status enum: `missed`, `declined`, `completed`
   - Changed field names: `receiverId`, `startedAt`, `endedAt`

2. **Call Events Updated** (`backend/socket/callEvents.ts`)
   - Replaced WebRTC signaling with Agora channel-based calls
   - Simplified call flow (no ICE candidates, offers, answers)
   - Events: `initiateCall`, `answerCall`, `declineCall`, `endCall`

### ✅ Frontend Changes
1. **Agora Constants** (`frontend/constants/agora.ts`)
   - Stored your Agora App ID: `74de6f0fa36d447aba58cb285cb09348`

2. **Agora Hook** (`frontend/hooks/useAgora.ts`)
   - Manages Agora RTC engine lifecycle
   - Handles audio/video streams
   - Controls: mute, camera, speaker, flip camera

3. **Call Screens**
   - `frontend/app/(main)/callScreen.tsx` - Active call UI
   - `frontend/app/(main)/incomingCall.tsx` - Incoming call UI

4. **Global Call Listener** (`frontend/app/_layout.tsx`)
   - Listens for incoming calls from anywhere in the app
   - Automatically navigates to incoming call screen

5. **Conversation Screen** (`frontend/app/(main)/conversation.tsx`)
   - Added voice and video call buttons in header
   - Only shows for direct (1-on-1) conversations
   - Initiates calls via socket

## Installation Steps

### 1. Install Agora SDK

```bash
cd frontend
npx expo install react-native-agora
```

### 2. Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Restart Backend

```bash
cd backend
npm run dev
```

### 4. Restart Frontend (with cache clear)

```bash
cd frontend
npx expo start -c
```

## How It Works

### Call Flow

1. **Initiating a Call**
   - User A clicks voice/video button in conversation with User B
   - Frontend emits `initiateCall` to backend
   - Backend creates Call record with unique Agora channel name
   - Backend notifies User B via `incomingCall` event
   - Backend responds to User A with `callInitiated` event

2. **Receiving a Call**
   - User B receives `incomingCall` event
   - App navigates to incoming call screen
   - User B can accept or decline

3. **Accepting a Call**
   - User B clicks accept
   - Frontend emits `answerCall` to backend
   - Backend updates call status to `completed`
   - Backend notifies User A via `callAnswered` event
   - Both users join the same Agora channel
   - Agora handles all audio/video streaming

4. **During Call**
   - Users can mute/unmute microphone
   - Users can turn camera on/off (video calls)
   - Users can toggle speaker
   - Users can flip camera (video calls)

5. **Ending a Call**
   - Either user clicks end call button
   - Frontend emits `endCall` to backend
   - Backend calculates duration and updates call record
   - Backend notifies other user via `callEnded` event
   - Both users leave Agora channel

## Testing Checklist

### Prerequisites
- [ ] Two test accounts logged in on different devices/emulators
- [ ] Both devices connected to backend
- [ ] Backend running locally at `http://172.25.255.16:3000`

### Voice Call Tests
- [ ] User A initiates voice call to User B
- [ ] User B receives incoming call notification
- [ ] User B accepts call
- [ ] Both users can hear each other
- [ ] Mute/unmute works for both users
- [ ] Speaker toggle works
- [ ] Call duration timer shows correctly
- [ ] Either user can end the call
- [ ] Call ends properly for both users

### Video Call Tests
- [ ] User A initiates video call to User B
- [ ] User B receives incoming call notification
- [ ] User B accepts call
- [ ] Both users can see and hear each other
- [ ] Camera on/off works for both users
- [ ] Flip camera works
- [ ] Mute/unmute works
- [ ] Local video shows in small window
- [ ] Remote video shows full screen
- [ ] Either user can end the call

### Edge Cases
- [ ] Decline call - User B declines, User A gets notified
- [ ] Missed call - User B is offline, call marked as missed
- [ ] Network issues - Call ends gracefully on disconnect
- [ ] Multiple calls - Can't initiate new call while in active call

## Troubleshooting

### Issue: "Cannot find module 'react-native-agora'"
**Solution:** Run `npx expo install react-native-agora` in frontend folder

### Issue: "Agora initialization failed"
**Solution:** 
1. Check your App ID is correct in `frontend/constants/agora.ts`
2. Verify Agora project is active in console.agora.io
3. Check if you need to enable App Certificate (for production)

### Issue: "No audio/video in call"
**Solution:**
1. Check device permissions (microphone, camera)
2. Test on real device (emulators may have issues)
3. Check Agora console for usage/errors

### Issue: "Call doesn't connect"
**Solution:**
1. Verify both users are online (check online status dot)
2. Check backend logs for socket events
3. Verify socket connection is active
4. Check network connectivity

### Issue: "Video shows black screen"
**Solution:**
1. Grant camera permissions
2. Test on real device (emulator cameras are limited)
3. Check if camera is being used by another app

## Production Considerations

### 1. Agora Token Authentication
For production, you should use Agora tokens instead of App ID only:
- Enable App Certificate in Agora console
- Generate tokens on your backend
- Pass token to `joinChannel` instead of empty string

### 2. TURN Servers
For better connectivity, consider adding TURN servers (though Agora handles this internally)

### 3. Call Quality
- Monitor call quality metrics in Agora console
- Implement network quality indicators
- Add reconnection logic for poor networks

### 4. Permissions
- Request camera/microphone permissions before call
- Handle permission denials gracefully
- Show permission instructions to users

### 5. Background Calls
- Implement background call handling
- Add push notifications for incoming calls
- Handle app state changes during calls

## Next Steps

1. **Install Agora SDK** (most important!)
2. **Test voice calls** between two devices
3. **Test video calls** between two devices
4. **Test edge cases** (decline, missed, etc.)
5. **Add call history UI** (optional - backend already tracks calls)
6. **Add push notifications** for incoming calls when app is closed

## Files Reference

### Backend
- `backend/modals/Call.ts` - Call database model
- `backend/socket/callEvents.ts` - Call socket events
- `backend/socket/socket.ts` - Main socket setup (already registers call events)

### Frontend
- `frontend/constants/agora.ts` - Agora App ID
- `frontend/hooks/useAgora.ts` - Agora RTC engine hook
- `frontend/app/(main)/callScreen.tsx` - Active call screen
- `frontend/app/(main)/incomingCall.tsx` - Incoming call screen
- `frontend/app/_layout.tsx` - Global incoming call listener
- `frontend/app/(main)/conversation.tsx` - Call buttons in header

## Support

If you encounter issues:
1. Check console logs (both frontend and backend)
2. Verify Agora App ID is correct
3. Test on real devices (not emulators)
4. Check Agora console for usage and errors
5. Ensure all dependencies are installed

---

**Status:** Implementation Complete ✅
**Next Action:** Install Agora SDK and test!
