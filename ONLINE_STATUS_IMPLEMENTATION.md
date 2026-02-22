# Online/Offline Status Feature - Complete Implementation

## ✅ What Was Implemented

A real-time online/offline status indicator system that shows when users are active.

## 🎯 How It Works

1. **User logs in** → Socket connects → Server marks them ONLINE → Broadcasts to all users
2. **User closes app** → Socket disconnects → Server marks them OFFLINE → Broadcasts to all users
3. **Real-time updates** → All connected users see status changes instantly

## 📁 Files Modified/Created

### Backend

**File:** `backend/socket/socket.ts`

**Changes:**
- Added `onlineUsers` Map to track userId → socketId
- On connection: Mark user ONLINE and broadcast `userOnline` event
- On disconnect: Mark user OFFLINE and broadcast `userOffline` event
- Send initial online users list to newly connected users

```typescript
const onlineUsers = new Map<string, string>();

// On connection
onlineUsers.set(userId, socket.id);
socket.broadcast.emit('userOnline', { userId });
socket.emit('onlineUsers', { success: true, data: Array.from(onlineUsers.keys()) });

// On disconnect
onlineUsers.delete(userId);
socket.broadcast.emit('userOffline', { userId });
```

### Frontend

#### 1. Created Hook: `frontend/hooks/useOnlineStatus.ts`

**Purpose:** Manage online users state and provide `isOnline()` function

**Features:**
- Listens to `onlineUsers` (initial list)
- Listens to `userOnline` (someone came online)
- Listens to `userOffline` (someone went offline)
- Provides `isOnline(userId)` function to check status

**Usage:**
```typescript
const { isOnline } = useOnlineStatus();
const online = isOnline(userId);
```

#### 2. Updated: `frontend/components/Avatar.tsx`

**Changes:**
- Added `showOnline` prop (boolean)
- Added `isOnline` prop (boolean)
- Renders green dot when online, gray when offline
- Dot size scales with avatar size (26% of avatar)

**Visual:**
```
[Avatar with green dot] = Online
[Avatar with gray dot] = Offline
[Avatar without dot] = Status not shown
```

#### 3. Updated: `frontend/components/ConversationItem.tsx`

**Changes:**
- Imported `useOnlineStatus` hook
- Calculated `online` status for direct conversations
- Passed `showOnline` and `isOnline` to Avatar

**Logic:**
```typescript
const { isOnline } = useOnlineStatus();
const online = isDirect ? isOnline(otherParticipant?._id || '') : false;

<Avatar 
  showOnline={item.type === "direct"}
  isOnline={online}
/>
```

#### 4. Updated: `frontend/app/(main)/home.tsx`

**Changes:**
- Imported `useOnlineStatus` hook
- Shows online status for contacts without conversations
- Displays "Online" (green) or "Offline" (gray) text

**Visual:**
```
[Avatar with dot] Krish
                  Online (green text)

[Avatar with dot] Tini
                  Offline (gray text)
```

#### 5. Updated: `frontend/app/(main)/conversation.tsx`

**Changes:**
- Imported `useOnlineStatus` hook
- Shows online status in conversation header
- Displays "Online" or "Offline" below name

**Visual:**
```
Header:
[Back] [Avatar with dot] Suvankar    [Menu]
                         Online
```

## 🎨 Visual Design

### Online Indicator
- **Color:** #22C55E (green)
- **Position:** Bottom-right of avatar
- **Size:** 26% of avatar size
- **Border:** White border (5% of avatar size)

### Offline Indicator
- **Color:** colors.neutral400 (gray)
- **Same position and size as online**

### Text Status
- **Online:** Green (#22C55E)
- **Offline:** Gray (colors.neutral400)

## 📱 User Experience

### Home Screen - Conversations
```
[Avatar●] Suvankar (bold)        2:34 PM
          Hey there! (bold)      [3]
```
Green dot = Online, Gray dot = Offline

### Home Screen - Contacts
```
[Avatar●] Krish
          Online (green)

[Avatar●] Tini
          Offline (gray)
```

### Conversation Header
```
[Back] [Avatar●] Suvankar    [Menu]
                 Online (green)
```

## 🔄 Real-Time Updates

### Scenario 1: User Comes Online
1. User A opens app
2. Backend adds User A to `onlineUsers`
3. Backend broadcasts `userOnline` to all connected users
4. All users see User A's dot turn green
5. Text changes from "Offline" to "Online"

### Scenario 2: User Goes Offline
1. User A closes app
2. Socket disconnects
3. Backend removes User A from `onlineUsers`
4. Backend broadcasts `userOffline` to all connected users
5. All users see User A's dot turn gray
6. Text changes from "Online" to "Offline"

### Scenario 3: New User Connects
1. User B opens app
2. Backend sends current online users list to User B
3. User B sees all currently online users with green dots
4. Backend broadcasts to others that User B is online

## 🧪 Testing

### Test 1: Basic Online/Offline
1. Login on Device 1 as User A
2. Login on Device 2 as User B
3. **Expected:** Both see each other as "Online" with green dot
4. Close app on Device 1
5. **Expected:** Device 2 sees User A as "Offline" with gray dot

### Test 2: Multiple Users
1. Login on 3 devices with different accounts
2. **Expected:** All see each other as online
3. Close one device
4. **Expected:** Other 2 devices see that user as offline

### Test 3: Conversation Header
1. User A opens conversation with User B
2. **Expected:** Header shows "Online" if User B is connected
3. User B closes app
4. **Expected:** Header updates to "Offline" in real-time

### Test 4: Reconnection
1. User A loses internet connection
2. **Expected:** Others see User A as offline
3. User A reconnects
4. **Expected:** Others see User A as online again

## 🐛 Troubleshooting

### Dot not showing:
- Check `showOnline={true}` is passed to Avatar
- Check `isOnline` prop is passed correctly
- Verify `useOnlineStatus` hook is imported

### Status not updating:
- Check socket connection is active
- Check backend is broadcasting events
- Check frontend is listening to events
- Look for console logs: `[Online] User came online: ...`

### Always showing offline:
- Check userId is correct
- Check backend `onlineUsers` Map has the user
- Check socket authentication is working
- Verify JWT token is valid

### Status incorrect on load:
- Check `onlineUsers` event is received on connection
- Check initial online users list is sent from backend
- Verify `useOnlineStatus` hook is setting initial state

## 📊 Backend Logs

When working correctly, you'll see:
```
[Online] User 123abc is now ONLINE. Total online: 3
[Online] User 456def is now OFFLINE. Total online: 2
```

## 📊 Frontend Logs

When working correctly, you'll see:
```
[Online] Initial online users: 2
[Online] User came online: 123abc
[Online] User went offline: 456def
```

## 🎯 Success Criteria

✅ Green dot appears when user is online
✅ Gray dot appears when user is offline
✅ Status updates in real-time (no refresh needed)
✅ Works in conversation list
✅ Works in contacts list
✅ Works in conversation header
✅ Shows "Online" or "Offline" text
✅ Survives app reconnection
✅ Works for multiple users simultaneously

## 🚀 How to Test

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npx expo start -c
   ```

3. **Login on 2 devices** with different accounts

4. **Observe:**
   - Both should see each other with green dots
   - Both should see "Online" status
   - Close one app → other sees gray dot and "Offline"

## 🎉 Result

Your chat app now has WhatsApp-style online/offline indicators that update in real-time!

Users can see:
- Who is currently online (green dot)
- Who is offline (gray dot)
- Real-time status changes
- Status in multiple places (list, header)
