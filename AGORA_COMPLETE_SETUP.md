# Complete Agora Implementation Setup

## Current Status
✅ Backend Call model updated with Agora channel support
✅ New Agora-based call events created (`backend/socket/callEvents.agora.ts`)
⏳ Frontend implementation needed

## Step-by-Step Implementation

### 1. Install Agora SDK (Frontend)

```bash
cd frontend
npx expo install react-native-agora
```

### 2. Get Agora App ID

1. Go to https://console.agora.io/
2. Create a new project or use existing one
3. Copy your App ID
4. Create `frontend/constants/agora.ts`:

```typescript
export const AGORA_APP_ID = 'YOUR_APP_ID_HERE';
```

### 3. Replace Backend Call Events

The new Agora-based call events are in `backend/socket/callEvents.agora.ts`.

Option A: Replace the existing file
```bash
cd backend/socket
mv callEvents.ts callEvents.webrtc.backup.ts
mv callEvents.agora.ts callEvents.ts
```

Option B: Manually copy the content from `callEvents.agora.ts` to `callEvents.ts`

### 4. Create Frontend Agora Hook

Create `frontend/hooks/useAgora.ts` with the Agora hook implementation.
(See the full implementation guide you provided)

### 5. Create Call Screens

Create these two new screens:
- `frontend/app/(main)/callScreen.tsx` - Active call UI
- `frontend/app/(main)/incomingCall.tsx` - Incoming call UI

### 6. Add Global Incoming Call Listener

In `frontend/app/_layout.tsx`, add the incoming call listener so calls work from anywhere.

### 7. Add Call Buttons to Conversation Screen

Update `frontend/app/(main)/conversation.tsx` header to include voice and video call buttons.

## Files Modified/Created

### Backend
- ✅ `backend/modals/Call.ts` - Updated
- ✅ `backend/socket/callEvents.agora.ts` - Created (needs to replace callEvents.ts)

### Frontend (To Create)
- ⏳ `frontend/constants/agora.ts`
- ⏳ `frontend/hooks/useAgora.ts`
- ⏳ `frontend/app/(main)/callScreen.tsx`
- ⏳ `frontend/app/(main)/incomingCall.tsx`

### Frontend (To Modify)
- ⏳ `frontend/app/_layout.tsx` - Add incoming call listener
- ⏳ `frontend/app/(main)/conversation.tsx` - Add call buttons

## Testing Checklist

After implementation:
1. ✅ Install Agora SDK
2. ✅ Add Agora App ID
3. ✅ Backend call events updated
4. ✅ Frontend hook created
5. ✅ Call screens created
6. ✅ Incoming call listener added
7. ✅ Call buttons added to conversation
8. Test voice call between two users
9. Test video call between two users
10. Test declining calls
11. Test missed calls (offline user)

## Next Action

Would you like me to:
1. Create all the frontend files now?
2. Create them one by one with explanations?
3. Provide the complete code for you to copy manually?

Let me know and I'll proceed!
