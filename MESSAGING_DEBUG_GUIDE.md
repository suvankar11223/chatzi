# Messaging Debug Guide

## How to Debug Messaging Issues

### Step 1: Check Backend Logs

When you send a message, you should see this in the backend terminal:

```
=== NEW MESSAGE EVENT ===
Socket ID: abc123
User: tini@test.com
Sender: { id: '...', name: 'Tini' }
Content: Hello
ConversationId: direct_xxx_yyy
Message created with ID: msg_id
Conversation participants: [
  { id: 'user1_id', name: 'Tini', email: 'tini@test.com' },
  { id: 'user2_id', name: 'Krish', email: 'krish@test.com' }
]
Sockets in conversation room: 2
Socket IDs in room: [ 'socket1', 'socket2' ]
Emitted to conversation room: direct_xxx_yyy
Total connected sockets: 2
Participant Tini (user1_id): 1 socket(s)
  - Emitted to socket: socket1
Participant Krish (user2_id): 1 socket(s)
  - Emitted to socket: socket2
=== MESSAGE SENT SUCCESSFULLY ===
```

### Step 2: Check Frontend Logs (Sender)

When you send a message, you should see:

```
=== SENDING MESSAGE ===
Conversation ID: direct_xxx_yyy
Message: Hello
Current User: { id: 'user1_id', name: 'Tini', email: 'tini@test.com' }
Emitting newMessage with payload: { conversationId: 'direct_xxx_yyy', sender: {...}, content: 'Hello' }
=== MESSAGE SENT ===
```

### Step 3: Check Frontend Logs (Receiver)

The receiver should see:

```
[DEBUG] Conversation: New message received: { success: true, data: {...} }
[DEBUG] Conversation: Adding message to list: Hello
[DEBUG] Conversation: Message added successfully
```

## Common Issues and Solutions

### Issue 1: "Sockets in conversation room: 0"

**Problem**: Users are not joining the conversation room

**Solution**:
1. Check that both users opened the conversation screen
2. Look for this log: `[DEBUG] Conversation: Joining room: direct_xxx_yyy`
3. Backend should show: `=== JOIN CONVERSATION EVENT ===`

### Issue 2: "Participant X: 0 socket(s)"

**Problem**: User is not connected to socket

**Solution**:
1. Check that user is logged in
2. Look for: `[DEBUG] Socket: ✓ Connected successfully`
3. If not connected, check backend is running
4. Verify IP address in `frontend/constants/index.ts`

### Issue 3: Message sent but not received

**Problem**: Socket events not being listened to

**Solution**:
1. Check receiver's logs for: `[DEBUG] Conversation: New message received`
2. If not showing, receiver might not be listening
3. Make sure receiver is on the conversation screen
4. Check that conversation IDs match

### Issue 4: Different conversation IDs

**Problem**: Sender and receiver have different conversation IDs

**Solution**:
1. Both users should see the SAME conversation ID
2. Check logs: `Conversation ID: direct_xxx_yyy`
3. If different, there's a bug in conversation creation
4. Delete conversations and start fresh

## Testing Checklist

### Before Testing:
- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Both phones/devices are on the same WiFi network
- [ ] IP address in `frontend/constants/index.ts` is correct
- [ ] Both users are logged in
- [ ] Both users see each other in Direct Messages

### Test Steps:
1. **User A**: Open conversation with User B
   - Check logs for: `Joining room: direct_xxx_yyy`
   - Note the conversation ID

2. **User B**: Open conversation with User A
   - Check logs for: `Joining room: direct_xxx_yyy`
   - Verify conversation ID matches User A's

3. **User A**: Send message "Test 1"
   - Check backend logs for message creation
   - Check backend logs for "Sockets in conversation room: 2"
   - Check backend logs for both participants receiving emission

4. **User B**: Should see "Test 1" appear
   - Check logs for: `New message received`
   - Check logs for: `Message added successfully`

5. **User B**: Send message "Test 2"
   - Repeat checks from step 3

6. **User A**: Should see "Test 2" appear
   - Repeat checks from step 4

### If Messages Still Don't Work:

1. **Restart Backend**:
   ```bash
   cd backend
   # Stop with Ctrl+C
   npm run dev
   ```

2. **Restart Frontend**:
   ```bash
   cd frontend
   # Stop with Ctrl+C
   npx expo start -c
   ```

3. **Clear App Data**:
   - On Android: Settings > Apps > Expo Go > Storage > Clear Data
   - On iOS: Delete and reinstall Expo Go

4. **Check Conversation ID**:
   - Both users MUST have the same conversation ID
   - If different, delete the conversation and create new one

5. **Verify Socket Connection**:
   - Look for: `[DEBUG] Socket: ✓ Connected successfully`
   - Look for: `[DEBUG] Socket transport: websocket`
   - If using polling instead of websocket, that's okay but slower

## Expected Flow

```
User A                          Backend                         User B
------                          -------                         ------
1. Login
   Socket connects ---------> Authenticates
                              Joins user room
                                                                2. Login
                                                                   Socket connects
                                                                   Authenticates
                                                                   Joins user room

3. Open conversation
   Join room "conv_123" ----> Adds socket to room
                                                                4. Open conversation
                                                                   Join room "conv_123"
                                                                   Adds socket to room

5. Send "Hello"
   Emit newMessage --------> Saves to DB
                              Emits to room "conv_123"
                              Emits to User A socket -----> Receives (optimistic)
                              Emits to User B socket -----> 6. Receives "Hello"
                                                                   Displays message
```

## Quick Debug Commands

### Check if backend is running:
```bash
curl http://localhost:3000
# Should return: "Server is running"
```

### Check if backend is accessible from network:
```bash
curl http://172.25.252.100:3000
# Should return: "Server is running"
```

### Test socket connection:
```bash
cd backend
npm run test-connection
```

### View all users in database:
Open MongoDB Compass or use:
```bash
cd backend
# Add this to seed.ts temporarily:
const users = await User.find({});
console.log(users);
```
