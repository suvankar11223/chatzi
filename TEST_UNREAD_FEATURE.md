# 🧪 Testing Unread Messages Feature

## Quick Test Guide

### Prerequisites
1. Backend server running
2. Two devices/emulators with the app installed
3. Two different user accounts logged in

---

## Test 1: Basic Unread Count

### Steps:
1. **Device A (User A):** Open home screen
2. **Device B (User B):** Open home screen
3. **Device A:** Send a message to User B
4. **Device B:** Check home screen

### Expected Result:
- ✅ Conversation with User A appears at the TOP of the list
- ✅ Unread badge shows "1"
- ✅ Name and message preview are BOLD
- ✅ Timestamp is in PRIMARY color

---

## Test 2: Multiple Messages

### Steps:
1. **Device A:** Send 5 messages to User B (one after another)
2. **Device B:** Check home screen (don't open conversation)

### Expected Result:
- ✅ Badge shows "5"
- ✅ Conversation stays at top
- ✅ Last message preview updates with each new message

---

## Test 3: Mark as Read

### Steps:
1. **Device B:** Open conversation with User A
2. Wait 1 second
3. **Device B:** Go back to home screen

### Expected Result:
- ✅ Badge disappears
- ✅ Name and message are no longer bold
- ✅ Timestamp returns to normal color

---

## Test 4: Auto-Sort (Move to Top)

### Steps:
1. **Device B:** Have conversations with Users A, C, and D
2. **User C:** Send a message to User B
3. **Device B:** Check home screen
4. **User D:** Send a message to User B
5. **Device B:** Check home screen again

### Expected Result:
- ✅ After step 3: Conversation with User C is at TOP
- ✅ After step 5: Conversation with User D is at TOP
- ✅ Both show unread badges

---

## Test 5: Group Chat

### Steps:
1. Create a group with Users A, B, and C
2. **User A:** Send a message in the group
3. **Device B (User B):** Check home screen
4. **Device C (User C):** Check home screen

### Expected Result:
- ✅ Both User B and User C see unread badge "1"
- ✅ Group conversation moves to top for both
- ✅ User A (sender) does NOT see unread badge

---

## Test 6: Sender Doesn't See Unread

### Steps:
1. **Device A:** Send a message to User B
2. **Device A:** Check home screen

### Expected Result:
- ✅ Conversation with User B is at top
- ✅ NO unread badge for User A
- ✅ Message preview shows the sent message

---

## Test 7: Large Unread Count

### Steps:
1. **Device A:** Send 150 messages to User B
2. **Device B:** Check home screen (don't open conversation)

### Expected Result:
- ✅ Badge shows "99+" (not "150")
- ✅ Badge is properly sized and readable

---

## Test 8: Real-Time Updates

### Steps:
1. **Device B:** Stay on home screen
2. **Device A:** Send a message to User B
3. Watch Device B (no refresh needed)

### Expected Result:
- ✅ Conversation INSTANTLY moves to top
- ✅ Badge appears/increments INSTANTLY
- ✅ No need to pull-to-refresh

---

## Test 9: Multiple Conversations

### Steps:
1. **Device B:** Have 10+ conversations
2. **Different users:** Send messages to User B at different times
3. **Device B:** Check home screen

### Expected Result:
- ✅ All conversations with new messages show badges
- ✅ Conversations are sorted by most recent message
- ✅ Opening any conversation clears only that badge

---

## Test 10: Image Messages

### Steps:
1. **Device A:** Send an image to User B
2. **Device B:** Check home screen

### Expected Result:
- ✅ Message preview shows "📷 Image"
- ✅ Unread badge shows "1"
- ✅ Conversation moves to top

---

## 🐛 Common Issues & Solutions

### Issue: Badge doesn't appear
**Solution:** Check backend logs - ensure `unreadCount` is being saved

### Issue: Conversation doesn't move to top
**Solution:** Check that `updatedAt` is being updated in backend

### Issue: Badge doesn't clear when opening chat
**Solution:** Check that `markAsRead` socket event is being emitted

### Issue: Unread count is wrong
**Solution:** Check that sender is excluded from unread count increment

---

## 📊 What to Check in Logs

### Backend Logs:
```
✓ Message saved: [messageId]
✓ Emitted to room: [conversationId]
✓ Updated conversation with unread counts
✓ Marked conversation as read for user
```

### Frontend Logs:
```
[DEBUG] handleNewMessage: { success: true, data: {...} }
[DEBUG] Updating existing conversation and moving to top: [conversationId]
=== MARK AS READ RESPONSE ===
Success: true
✓ Conversation marked as read
```

---

## ✅ Success Criteria

All tests should pass with:
- Instant UI updates (no lag)
- Accurate unread counts
- Proper sorting (newest on top)
- Clean badge design
- Works for both direct and group chats

---

## 🎯 Performance Check

- Messages should appear in < 100ms
- Conversations should move to top instantly
- No UI freezing or lag
- Smooth animations
- No duplicate messages

---

Happy Testing! 🚀
