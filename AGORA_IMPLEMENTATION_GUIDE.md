# Agora Voice/Video Call Implementation Guide

## Overview
This guide will help you implement Agora-based voice and video calling in your chat app, replacing the existing WebRTC implementation.

## Prerequisites
1. Get your Agora App ID from https://console.agora.io/
2. Install Agora SDK

## Step 1: Install Agora SDK

```bash
cd frontend
npx expo install react-native-agora
```

## Step 2: Create Agora Constants File

Create `frontend/constants/agora.ts`:

```typescript
export const AGORA_APP_ID = 'YOUR_AGORA_APP_ID_HERE';
```

Replace `YOUR_AGORA_APP_ID_HERE` with your actual Agora App ID.

## Step 3: Update Backend Call Model

The backend Call model needs to include `agoraChannel` field.
File: `backend/modals/Call.ts` - Already has the structure, just needs minor updates.

## Step 4: Update Backend Call Events

File: `backend/socket/callEvents.ts` - Needs to be updated to use Agora channels.

## Step 5: Create Agora Hook

Create `frontend/hooks/useAgora.ts` - This hook manages Agora RTC engine.

## Step 6: Create Call Screens

1. `frontend/app/(main)/callScreen.tsx` - Active call screen
2. `frontend/app/(main)/incomingCall.tsx` - Incoming call screen

## Step 7: Wire into Existing Screens

Update conversation screen to add call buttons.

## Next Steps

See the detailed implementation in the following files:
- AGORA_BACKEND_IMPLEMENTATION.md
- AGORA_FRONTEND_IMPLEMENTATION.md
- AGORA_INTEGRATION_STEPS.md
