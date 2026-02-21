# Quick Messaging Test

## Step-by-Step Test (Do this EXACTLY)

### 1. Start Backend
```bash
cd backend
npm run dev
```

Wait for:
```
SERVER STARTED SUCCESSFULLY
Socket.IO ready for connections
```

### 2. Login on Phone 1 (You)
- Login as: `suvankar@test.com` / `password123`
- Wait for home screen to load
- You should see 3 users: Tini, bdbb, Krish

### 3. Login on Phone 2 (Friend)
- Login as: `krish@test.com` / `password123`
- Wait for home screen to load
- Should see 3 users: Tini, Suvankar, bdbb

### 4. Check Backend Logs
You should see:
```
[DEBUG] Socket: User connected - suvankar@test.com (socket_abc)
[DEBUG] Socket: User connected - krish@test.com (socket_xyz)
```

If you DON'T see both connections, STOP HERE. The socket is not connecting.

### 5. Phone 1: Open Chat with Krish
- Tap on "Krish" in Direct Messages
- Wait for conversation screen to open

### 6. Check Backend Logs
Should see:
```
=== JOIN CONVERSATION EVENT ===
User: suvankar@test.com
Conversation ID: direct_xxx_yyy
Sockets in room: 1
```

### 7. Phone 2: Open Chat with Suvankar
- Tap on "Suvankar" in Direct Messages
- Wait for conversation screen to open

### 8. Check Backend Logs
Should see:
```
=== JOIN CONVERSATION EVENT ===
User: krish@test.com
Conversation ID: direct_xxx_yyy  <-- MUST BE SAME AS STEP 6!
Sockets in room: 2  <-- MUST BE 2!
```

**CRITICAL**: If the conversation IDs are different, or if "Sockets in room" is not 2, STOP HERE.

### 9. Phone 1: Send Message "Test 1"
- Type "Test 1"
- Press send

### 10. Check Backend Logs
Should see:
```
============================================================
=== NEW MESSAGE EVENT ===
============================================================
User: suvankar@test.com
Content: Test 1
ConversationId: direct_xxx_yyy
✓ Data validation passed
✓ Message saved to database with ID: msg_123
✓ Conversation found
Conversation participants: [
  { id: 'user1', name: 'Suvankar', email: 'suvankar@test.com' },
  { id: 'user2', name: 'Krish', email: 'krish@test.com' }
]
============================================================
ROOM STATUS:
Sockets in room: 2  <-- MUST BE 2!
Socket IDs in room: [ 'socket_abc', 'socket_xyz' ]
============================================================
EMITTING TO PARTICIPANTS:
Participant: Suvankar (user1)
  - Connected sockets: 1
  - ✓ Emitted to socket: socket_abc
Participant: Krish (user2)
  - Connected sockets: 1
  - ✓ Emitted to socket: socket_xyz
============================================================
✓ Total emissions: 2
============================================================
=== MESSAGE SENT SUCCESSFULLY ===
```

### 11. Check Phone 2 (Krish)
Should see "Test 1" appear in the chat.

### 12. Check Phone 2 Logs (Expo terminal)
Should see:
```
[DEBUG] Conversation: New message received: { success: true, ... }
[DEBUG] Conversation: Adding message to list: Test 1
[DEBUG] Conversation: Message added successfully
```

## If It Doesn't Work

### Problem 1: "Sockets in room: 0" or "Sockets in room: 1"
**Cause**: Users didn't join the room properly.

**Fix**:
1. Make sure BOTH users are on the conversation screen
2. Close and reopen the conversation on both phones
3. Check that both see the same conversation ID in logs

### Problem 2: Different Conversation IDs
**Cause**: Two separate conversations were created.

**Fix**:
1. Go back to home screen on both phones
2. Delete the conversation (swipe left on iOS, long press on Android)
3. Start fresh - Phone 1 taps on Phone 2's name first
4. Then Phone 2 opens the conversation

### Problem 3: "Connected sockets: 0" for a participant
**Cause**: User's socket is not connected.

**Fix**:
1. Check that user is logged in
2. Look for socket connection logs
3. Restart the app if needed

### Problem 4: No backend logs at all
**Cause**: Backend is not running or not accessible.

**Fix**:
1. Make sure backend is running: `npm run dev`
2. Check IP address in `frontend/constants/index.ts`
3. Make sure both phones are on same WiFi as computer

## What the Logs Tell You

- **"Sockets in room: 2"** = Both users are in the room ✓
- **"Sockets in room: 1"** = Only one user is in the room ✗
- **"Sockets in room: 0"** = No users in the room ✗
- **"Total emissions: 2"** = Message sent to both users ✓
- **"Total emissions: 1"** = Message sent to only one user ✗
- **"Connected sockets: 0"** = User is not connected ✗

## Copy These Logs and Share

If it still doesn't work, copy and share:

1. Backend logs from step 10 (the entire NEW MESSAGE EVENT section)
2. Phone 1 logs (Expo terminal)
3. Phone 2 logs (Expo terminal)
4. Tell me what you see on each phone screen

This will tell me EXACTLY where the problem is.
