# 🔥 Professional Chat Feature: Unread Messages & Auto-Sort

## ✅ What We Built

A WhatsApp-level chat experience with:
- **Unread message count badges** on conversations
- **Auto-sort conversations** by latest message (newest on top)
- **Real-time updates** when new messages arrive
- **Instant UI feedback** with optimistic updates
- **Mark as read** when opening a conversation
- **Works for both direct messages and groups**

---

## 🎯 How It Works

### 1. Backend - Unread Count Tracking

#### Message Schema (`backend/modals/Message.ts`)
```typescript
readBy: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
}]
```
- Tracks which users have read each message
- Sender is automatically added to `readBy` when message is created

#### Conversation Schema (`backend/modals/Conversation.ts`)
```typescript
unreadCount: {
  type: Map,
  of: Number,
  default: {},
}
```
- Stores unread count per user (Map structure)
- Example: `{ "userId1": 3, "userId2": 0 }`

### 2. Backend - Real-Time Updates

#### When New Message Arrives (`backend/socket/chatEvents.ts`)
```typescript
socket.on("newMessage", async (data) => {
  // 1. Save message with sender in readBy
  const message = await Message.create({
    conversationId: data.conversationId,
    senderId: data.sender.id,
    content: data.content || '',
    attachment: data.attachment || null,
    readBy: [data.sender.id], // Sender has read their own message
  });

  // 2. Emit to all participants immediately
  io.to(data.conversationId).emit("newMessage", messageData);

  // 3. Update conversation in background
  // - Increment unread count for all participants except sender
  // - Update lastMessage reference
  // - Update updatedAt timestamp
});
```

#### Mark as Read (`backend/socket/chatEvents.ts`)
```typescript
socket.on("markAsRead", async (data) => {
  // 1. Reset unread count for this user
  conversation.unreadCount.set(userId.toString(), 0);
  
  // 2. Mark all messages as read
  await Message.updateMany(
    { conversationId, senderId: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
});
```

### 3. Frontend - UI Updates

#### ConversationItem Component (`frontend/components/ConversationItem.tsx`)
```typescript
const unreadCount = item.unreadCount || 0;
const hasUnread = unreadCount > 0;

// Bold text for unread conversations
<Typo fontWeight={hasUnread ? "700" : "600"}>
  {conversationName}
</Typo>

// Unread badge
{hasUnread && (
  <View style={styles.badge}>
    <Typo size={12} fontWeight="700" color={colors.white}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </Typo>
  </View>
)}
```

#### Home Screen - Auto Sort (`frontend/app/(main)/home.tsx`)
```typescript
const handleNewMessage = (res: ResponseProps) => {
  setConversations((prev) => {
    const existingConv = prev.find(conv => conv._id === conversationId);
    
    if (existingConv) {
      const isMyMessage = sender.id === user?.id;
      
      // Update conversation
      const updatedConv = {
        ...existingConv,
        lastMessage: { ... },
        updatedAt: createdAt,
        // Increment unread only if NOT my message
        unreadCount: isMyMessage ? existingConv.unreadCount : (existingConv.unreadCount || 0) + 1,
      };
      
      // 🔥 MOVE TO TOP
      const filtered = prev.filter(c => c._id !== conversationId);
      return [updatedConv, ...filtered];
    }
  });
};
```

#### Conversation Screen - Mark as Read (`frontend/app/(main)/conversation.tsx`)
```typescript
useEffect(() => {
  // When opening conversation, mark as read
  socket.emit('markAsRead', { conversationId });
  
  // Listen for confirmation
  socket.on('markAsRead', onMarkAsRead);
}, [conversationId]);
```

---

## 🎨 UI/UX Features

### Unread Badge Styling
```typescript
badge: {
  backgroundColor: colors.primary,
  minWidth: 22,
  height: 22,
  borderRadius: 11,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 6,
}
```

### Visual Indicators
- **Bold name** when unread messages exist
- **Bold message preview** when unread
- **Primary color timestamp** when unread
- **Badge with count** (shows "99+" for 100+)
- **Image icon** (📷) for image messages

---

## 🔄 Real-Time Flow

### Scenario: User A sends message to User B

1. **User A's device:**
   - Optimistic update (instant UI)
   - Message sent to backend
   - Backend confirms → replace optimistic message
   - Conversation stays at top (no unread count for sender)

2. **Backend:**
   - Save message with `readBy: [userA]`
   - Emit to conversation room
   - Increment unread count for User B
   - Update conversation's `lastMessage` and `updatedAt`

3. **User B's device:**
   - Receive new message via socket
   - Add message to conversation
   - Increment unread count
   - **Move conversation to top of list**
   - Show unread badge

4. **User B opens conversation:**
   - Emit `markAsRead` event
   - Backend resets unread count
   - Backend marks messages as read
   - Home screen updates (badge disappears)

---

## 🚀 Key Features

### ✅ Works for Direct Messages
- Shows unread count from other user
- Resets when you open the chat

### ✅ Works for Groups
- Shows total unread count from all members
- Resets when you open the group chat

### ✅ Optimistic Updates
- Instant UI feedback when sending
- No waiting for backend confirmation
- Smooth user experience

### ✅ Auto-Sort by Latest
- Newest conversations always on top
- Updates in real-time
- Matches WhatsApp behavior

### ✅ Professional Badge Design
- Clean, modern look
- Handles large numbers (99+)
- Primary color for visibility

---

## 🧪 Testing

### Test Scenario 1: Direct Message
1. User A sends message to User B
2. **Expected:** User B sees badge with count "1"
3. User B opens conversation
4. **Expected:** Badge disappears

### Test Scenario 2: Multiple Messages
1. User A sends 5 messages to User B
2. **Expected:** User B sees badge with count "5"
3. User B opens conversation
4. **Expected:** Badge disappears, all messages marked as read

### Test Scenario 3: Group Chat
1. User A sends message in group
2. **Expected:** All other members see badge with count "1"
3. User B opens group
4. **Expected:** Badge disappears for User B only

### Test Scenario 4: Auto-Sort
1. User A has conversations with B, C, D
2. User C sends a message
3. **Expected:** Conversation with C moves to top
4. User D sends a message
5. **Expected:** Conversation with D moves to top

---

## 📊 Database Structure

### Message Document
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  content: "Hello!",
  attachment: null,
  readBy: [ObjectId("sender"), ObjectId("reader1")],
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Document
```javascript
{
  _id: ObjectId,
  type: "direct" | "group",
  participants: [ObjectId, ObjectId],
  lastMessage: ObjectId,
  unreadCount: {
    "userId1": 3,
    "userId2": 0
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Performance Optimizations

1. **Optimistic Updates:** Instant UI feedback
2. **Background Processing:** Unread count updates don't block message delivery
3. **Efficient Queries:** Only fetch unread count for current user
4. **Socket Rooms:** Messages only sent to conversation participants
5. **Batch Updates:** Mark multiple messages as read in single query

---

## 🔧 Configuration

No configuration needed! The feature works out of the box with your existing:
- MongoDB database
- Socket.IO connection
- React Native app
- TypeScript types

---

## 📝 Summary

You now have a professional-grade chat feature that:
- ✅ Shows unread message counts
- ✅ Auto-sorts conversations by latest message
- ✅ Updates in real-time via Socket.IO
- ✅ Works for both direct messages and groups
- ✅ Provides instant UI feedback
- ✅ Matches WhatsApp-level UX

The implementation is clean, efficient, and scalable! 🚀
