# Instructions for Your Friend

Hey! Send this to your friend so they know what to do:

---

## Quick Steps to Fix the Contact Issue

Hi! We need to reload the app to see each other's accounts. Here's what to do:

### Step 1: Close the App Completely
1. Swipe up from bottom of screen (or double-tap home button)
2. Find "Expo Go" in recent apps
3. Swipe it away to close it completely

### Step 2: Reopen Expo Go
1. Tap the Expo Go icon to open it again
2. Find the "chatzi" app in your recent projects
3. Tap to open it

### Step 3: Reload the App
1. Shake your phone (yes, literally shake it!)
2. A menu will appear
3. Tap "Reload"
4. Wait for the app to reload

### Step 4: Login Again
1. Use your existing email and password
2. Login to the app
3. Go to the home screen

### Step 5: Check Direct Messages
1. Make sure you're on the "Direct Messages" tab (not Groups)
2. You should now see the other user's account
3. Tap on it to start chatting!

## If You Still Don't See Each Other

Try this:
1. On the home screen, **swipe down** on the contact list
2. This will refresh and fetch the latest contacts
3. Wait a few seconds
4. You should see each other now

## What Was Fixed

The app now:
- Loads contacts immediately after login
- Has a pull-to-refresh feature (swipe down)
- Better handles slow connections
- Shows better error messages

## Need Help?

If you still can't see each other after following these steps:
1. Make sure you're both on the same app version (both reloaded)
2. Check if the backend is running: https://chatzi-1m0m.onrender.com
3. Wait 60 seconds if the backend was sleeping
4. Try pull-to-refresh again

---

## For the Developer (You)

### What to Check:

1. **Backend Logs on Render:**
   - Go to https://dashboard.render.com
   - Click on your "chatzi" service
   - Check the logs for:
     ```
     [DEBUG] getContacts API: Found X contacts
     [DEBUG] Contact names: ...
     ```

2. **Frontend Logs in Expo:**
   - Look for:
     ```
     [DEBUG] AuthContext: Prefetched X contacts
     [DEBUG] ✓ Successfully fetched X contacts from API
     ```

3. **Database Check:**
   - Go to MongoDB Atlas
   - Check the "users" collection
   - Verify both users exist with correct emails

### Common Issues:

**Issue**: Backend is sleeping (Render free tier)
**Solution**: Visit https://chatzi-1m0m.onrender.com in browser to wake it up, wait 60 seconds

**Issue**: One user sees the other but not vice versa
**Solution**: The user who doesn't see contacts needs to reload the app again

**Issue**: "Connection issue" message
**Solution**: Backend is down or unreachable. Check Render dashboard.

**Issue**: "No users available"
**Solution**: Pull down to refresh, or check if users are in database

### Testing Checklist:

- [ ] Both users have reloaded the app
- [ ] Both users have logged in
- [ ] Backend is running on Render
- [ ] Both users are in the database
- [ ] Both users are on "Direct Messages" tab
- [ ] Tried pull-to-refresh
- [ ] Waited 60 seconds for backend to wake up

### Debug Commands:

Check backend is running:
```bash
curl https://chatzi-1m0m.onrender.com
```

Test contacts endpoint (replace TOKEN with actual token):
```bash
curl -H "Authorization: Bearer TOKEN" https://chatzi-1m0m.onrender.com/api/user/contacts
```

### Files to Check:

If you need to debug further:
- `frontend/context/authContext.tsx` - Login/signup flow
- `frontend/app/(main)/home.tsx` - Contact display
- `frontend/services/contactsService.ts` - API calls
- `backend/controller/user.controller.ts` - Backend endpoint

### Next Steps if Still Not Working:

1. Check if both users are actually in MongoDB
2. Verify authentication tokens are valid
3. Test API endpoint directly with Postman
4. Check network connectivity
5. Look for error messages in logs
