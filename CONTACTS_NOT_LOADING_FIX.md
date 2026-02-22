# Contacts Not Loading - Troubleshooting Guide

## Problem
No users are showing up in Direct Messages or Groups tabs.

## Root Causes & Solutions

### 1. Database Not Seeded
The most common issue - no users exist in the database.

**Solution:**
```bash
cd backend
npm run seed
```

This will create 4 test users:
- tini@test.com / password123
- suvankar@test.com / password123
- bdbb@test.com / password123
- krish@test.com / password123

### 2. Backend Server Not Running
Check if the backend is running on port 3000.

**Solution:**
```bash
cd backend
npm run dev
```

### 3. Network Connection Issues
The frontend can't reach the backend server.

**Check:**
- Open `frontend/utils/network.ts`
- Verify `COMPUTER_IP` matches your computer's IP address
- Get your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

**Current IP in code:** `172.25.254.47`

**Update if needed:**
```typescript
const COMPUTER_IP = "YOUR_ACTUAL_IP_HERE";
```

### 4. Socket Connection Failing
Socket might not be connecting properly.

**Test Socket Connection:**
Add this to your home screen temporarily:
```typescript
useEffect(() => {
  const socket = getSocket();
  console.log('[DEBUG] Socket status:', socket?.connected ? 'CONNECTED' : 'DISCONNECTED');
}, []);
```

### 5. API Endpoint Not Working
The `/api/user/contacts` endpoint might be failing.

**Test API Directly:**
```bash
# Get your auth token from AsyncStorage first
# Then test the endpoint:
curl -H "Authorization: Bearer YOUR_TOKEN" http://YOUR_IP:3000/api/user/contacts
```

## Quick Fix Steps

### Step 1: Seed the Database
```bash
cd backend
npm run seed
```

### Step 2: Restart Backend
```bash
cd backend
npm run dev
```

### Step 3: Clear App Cache
In your app:
1. Logout
2. Close the app completely
3. Reopen and login again

### Step 4: Check Logs
Look for these debug messages:
- `[DEBUG] getContacts API: Found X contacts`
- `[DEBUG] Loading contacts from API`
- `[DEBUG] API returned: X contacts`

## Expected Behavior

After fixing:
1. Login with one account (e.g., tini@test.com)
2. Go to Direct Messages tab
3. You should see 3 other users (Suvankar, bdbb, Krish)
4. Tap any user to start chatting

## Still Not Working?

### Enable Detailed Logging
The code already has extensive logging. Check your console for:
- `[DEBUG] Home: Fetching initial data from API`
- `[DEBUG] getContacts API: Found X contacts`
- `[DEBUG] Contact names: ...`

### Force Refresh
Pull down on the home screen to trigger a manual refresh.

### Check Database Directly
```bash
# Connect to MongoDB
mongosh YOUR_MONGO_URI

# Check users
use your_database_name
db.users.find({}, {name: 1, email: 1})
```

## Common Mistakes

1. **Wrong IP Address**: Make sure `COMPUTER_IP` in `network.ts` is correct
2. **Backend Not Running**: Backend must be running on port 3000
3. **No Users in DB**: Run the seed script
4. **Logged in as Wrong User**: If you're the only user, you won't see anyone
5. **Cache Issues**: Clear app cache by logging out and back in

## Testing Multiple Users

To test properly:
1. Login on Device 1 as tini@test.com
2. Login on Device 2 (or emulator) as suvankar@test.com
3. Both should see each other in Direct Messages
4. Tap to start a conversation

## Code Flow

1. `home.tsx` calls `loadContactsFromAPI()`
2. `contactsService.ts` calls `fetchContactsFromAPI()`
3. Fetches from `http://YOUR_IP:3000/api/user/contacts`
4. Backend `user.controller.ts` `getContacts()` returns all users except current user
5. Frontend displays users in Direct Messages tab

## Debug Checklist

- [ ] Backend server is running
- [ ] Database is seeded with test users
- [ ] IP address in `network.ts` is correct
- [ ] Can access `http://YOUR_IP:3000/api/health` from device
- [ ] Logged in successfully
- [ ] Console shows contact loading logs
- [ ] Tried pull-to-refresh
- [ ] Cleared app cache (logout/login)
