# ✅ Agora Implementation Complete!

## What's Been Done

### 1. Packages Installed ✅
- `react-native-agora` - Agora SDK for voice/video
- `react-native-permissions` - Permission handling

### 2. Frontend Files Created ✅
- `frontend/constants/agora.ts` - Agora App ID configuration
- `frontend/hooks/useAgora.ts` - Agora hook for call management
- `frontend/app/(main)/callScreen.tsx` - Active call screen
- `frontend/app/(main)/incomingCall.tsx` - Incoming call screen

### 3. Backend Files Created ✅
- `backend/socket/callEvents.ts` - Socket events for calls (already registered in socket.ts)
- `backend/modals/Call.ts` - Call model (already exists)

### 4. App Layout Updated ✅
- `frontend/app/_layout.tsx` - Added incoming call listener

---

## ⚠️ IMPORTANT: Manual Step Required

The conversation.tsx file needs call buttons added. Here's what to do:

### Add to conversation.tsx imports:
```typescript
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
```

### Add after the state declarations (around line 50):
```typescript
const router = useRouter();

const startCall = (callType: 'voice' | 'video') => {
  if (!isDirect || !otherUserId) {
    Alert.alert('Error', 'Calls are only available in direct conversations');
    return;
  }

  const socket = getSocket();
  if (!socket || !socket.connected) {
    Alert.alert('Error', 'Not connected to server');
    return;
  }

  socket.emit('initiateCall', {
    receiverId: otherUserId,
    callType,
    conversationId,
    callerName: currentUser?.name || 'Unknown',
    callerAvatar: currentUser?.avatar || '',
  });

  socket.once('callInitiated', ({ callId, channelName }: any) => {
    router.push({
      pathname: '/(main)/callScreen' as any,
      params: {
        callId,
        channelName,
        callType,
        name: conversationName,
        avatar: conversationAvatar || '',
        otherUserId,
        isCaller: 'true',
      },
    });
  });
};
```

### Add to the header right section (replace the ellipsis button section):
```typescript
right={
  <View style={styles.headerRight}>
    {/* Call buttons - only show for direct conversations */}
    {isDirect && otherUserId && (
      <>
        <TouchableOpacity 
          onPress={() => startCall('voice')} 
          style={{ marginRight: 16 }}
        >
          <Feather name="phone" size={22} color={colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => startCall('video')}>
          <Feather name="video" size={22} color={colors.white} />
        </TouchableOpacity>
      </>
    )}
    
    <TouchableOpacity>
      <Ionicons
        name="ellipsis-vertical"
        size={24}
        color={colors.white}
      />
    </TouchableOpacity>
  </View>
}
```

---

## 🚀 Next Steps

### 1. Update app.json
Add permissions plugin:
```json
{
  "expo": {
    "plugins": [
      "expo-dev-client",
      [
        "react-native-permissions",
        {
          "androidPermissions": [
            "CAMERA",
            "RECORD_AUDIO",
            "MODIFY_AUDIO_SETTINGS"
          ]
        }
      ]
    ]
  }
}
```

### 2. Rebuild the App
```bash
eas build --platform android --profile development
```

### 3. Install the New APK
Download from: https://expo.dev/accounts/babu223/projects/chatzi/builds/

### 4. Start Dev Server
```bash
cd frontend
npx expo start --dev-client
```

---

## 📱 How It Works

### Making a Call
1. User taps phone/video icon in conversation
2. Socket emits `initiateCall` to backend
3. Backend creates Call record and notifies receiver
4. Caller joins Agora channel
5. Receiver sees incoming call screen

### Receiving a Call
1. Backend emits `incomingCall` to receiver
2. Receiver sees full-screen incoming call UI
3. Vibration starts
4. Accept → joins Agora channel
5. Decline → notifies caller

### During Call
- Voice: Mute, speaker toggle, end call
- Video: Mute, camera on/off, flip camera, end call
- Timer shows call duration
- Either user can end call

---

## ✅ Checklist

- [x] Agora packages installed
- [x] Agora constants created (App ID: 74de6f0fa36d447aba58cb285cb09348)
- [x] useAgora hook created
- [x] callScreen.tsx created
- [x] incomingCall.tsx created
- [x] Backend Call model exists
- [x] Backend callEvents.ts created
- [x] callEvents registered in socket.ts
- [x] _layout.tsx listens for incoming calls
- [ ] conversation.tsx needs call buttons (manual step above)
- [ ] app.json needs permissions plugin
- [ ] Rebuild with EAS
- [ ] Install new APK
- [ ] Test calls!

---

## 🎯 Testing

1. Install APK on 2 devices
2. Log in as different users
3. Open conversation
4. Tap phone icon (voice) or video icon (video)
5. Other device shows incoming call
6. Accept and test call features

---

## 📝 Notes

- Agora App ID is already configured: `74de6f0fa36d447aba58cb285cb09348`
- Backend is deployed on Render: `https://chatzi-1m0m.onrender.com`
- Test users: tini@test.com, suvankar@test.com (password: password123)
- Calls only work in direct conversations (not groups)

---

## 🔧 If You Get Errors

### "Cannot find module react-native-agora"
- Rebuild the app with EAS (Agora needs native modules)

### "Permission denied"
- Make sure app.json has permissions plugin
- Rebuild after adding permissions

### "User is offline"
- Make sure both users are logged in
- Check socket connection

### Call doesn't connect
- Check Agora App ID is correct
- Make sure both devices have internet
- Check backend logs for errors

---

You're almost done! Just add the call buttons to conversation.tsx, rebuild, and test! 🚀
