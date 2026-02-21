# Group Functionality Guide

## What Was Restored

The group creation functionality is now fully working! Here's what you can do:

### Features:
1. **Floating Action Button (FAB)** - A circular "+" button appears in the bottom-right corner when you're on the "Groups" tab
2. **Create Group Modal** - Tap the FAB to open the group creation screen
3. **Group Name** - Enter a name for your group
4. **Group Avatar** - Tap the avatar placeholder to upload a group profile picture
5. **Select Participants** - Choose at least 2 people to add to the group
6. **Create Button** - Tap "Create Group" to create the group

## How to Use

### Step 1: Navigate to Groups Tab
1. Open the app and go to the home screen
2. Tap on the "Groups" tab at the top
3. You'll see a circular "+" button in the bottom-right corner

### Step 2: Open Group Creation
1. Tap the "+" button (FAB)
2. The "New Group" screen will open

### Step 3: Set Up Your Group
1. **Add Group Avatar (Optional)**:
   - Tap the large circular avatar at the top
   - Choose an image from your gallery
   - The image will be uploaded to Cloudinary

2. **Enter Group Name (Required)**:
   - Tap the "Group Name" input field
   - Type a name for your group
   - Example: "Family", "Work Team", "Friends"

3. **Select Participants (Minimum 2)**:
   - Scroll through the list of users
   - Tap on users to select them
   - Selected users will have a yellow checkmark
   - You need at least 2 participants (besides yourself)

### Step 4: Create the Group
1. Once you have:
   - A group name
   - At least 2 selected participants
2. The "Create Group" button will be enabled
3. Tap "Create Group"
4. The group will be created and you'll be taken to the group chat

### Step 5: View Your Groups
1. Go back to the home screen
2. Tap on the "Groups" tab
3. Your newly created group will appear in the list
4. Tap on it to open the group chat

## Features in the Group Modal

### Contact Sections:
The contacts are organized into sections:

1. **FROM YOUR CONTACTS** - Users who are in your phone contacts
2. **OTHER USERS** / **REAL USERS** - Other registered users
3. **SAMPLE DATA** - Test/sample users (if any)

### Selection Indicator:
- Unselected: Empty circle with gray border
- Selected: Circle with yellow checkmark inside

### Group Info Display:
- Large circular avatar placeholder at the top
- Group name input field below the avatar
- Scrollable list of contacts

## Backend Support

The backend already handles:
- Creating group conversations
- Storing group name and avatar
- Adding multiple participants
- Populating participant details
- Real-time updates to all group members

## Testing Checklist

- [ ] FAB appears on Groups tab
- [ ] FAB disappears on Direct Messages tab
- [ ] Tapping FAB opens group creation modal
- [ ] Can tap avatar to select image
- [ ] Can enter group name
- [ ] Can select multiple participants
- [ ] Checkmarks appear for selected users
- [ ] Create button is disabled until name + 2 participants
- [ ] Create button works when requirements met
- [ ] Group appears in Groups tab after creation
- [ ] Can open group chat
- [ ] All participants can see the group

## Code Structure

### Frontend Files:
- `frontend/app/(main)/home.tsx` - Home screen with FAB
- `frontend/app/(main)/newConversationModal.tsx` - Group creation modal
- `frontend/services/imageService.ts` - Image upload to Cloudinary

### Backend Files:
- `backend/socket/chatEvents.ts` - Handles `newConversation` event
- `backend/modals/Conversation.ts` - Conversation model (supports groups)

## Socket Events

### Creating a Group:
```javascript
socket.emit('newConversation', {
  type: 'group',
  name: 'Group Name',
  participants: [userId1, userId2, userId3],
  avatar: 'cloudinary_url' // optional
});
```

### Response:
```javascript
socket.on('newConversation', (response) => {
  if (response.success) {
    // response.data contains the populated group conversation
    // Navigate to group chat
  }
});
```

## Troubleshooting

### Issue: FAB not visible
**Solution**: Make sure you're on the "Groups" tab, not "Direct Messages"

### Issue: Can't select participants
**Solution**: 
- Make sure contacts are loaded (pull down to refresh)
- Check if socket is connected
- Verify users exist in the database

### Issue: Create button disabled
**Solution**: 
- Enter a group name
- Select at least 2 participants (besides yourself)

### Issue: Image upload fails
**Solution**:
- Check Cloudinary credentials in backend `.env`
- Verify image permissions on device
- Try a smaller image

### Issue: Group not appearing
**Solution**:
- Pull down to refresh on Groups tab
- Check backend logs for errors
- Verify socket connection

## Next Steps

After creating a group:
1. Send messages in the group chat
2. All participants will receive messages
3. Group appears in everyone's Groups tab
4. Can add more features like:
   - Edit group name
   - Change group avatar
   - Add/remove participants
   - Group admin features
   - Leave group option

## Notes

- The current user is automatically added to the group
- Group avatar is optional (defaults to a group icon)
- Group name is required
- Minimum 3 total participants (you + 2 others)
- Groups are sorted by most recent activity
- Real-time updates via Socket.IO
