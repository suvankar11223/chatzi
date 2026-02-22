# Test Contacts Loading - Complete Guide

## How It Works

When you login with any account, the app automatically:

1. **Login** → Gets JWT token
2. **Navigate to Home** → Home screen loads
3. **Fetch Contacts** → Calls `/api/user/contacts` with token
4. **Display Contacts** → Shows all users except yourself

## Backend Logic

The `/api/user/contacts` endpoint:
```typescript
// Returns all users EXCEPT the current logged-in user
const users = await User.find({ _id: { $ne: currentUserId } })
```

So if you login as:
- **tini@test.com** → You see: Suvankar, bdbb, Krish (3 contacts)
- **suvankar@test.com** → You see: Tini, bdbb, Krish (3 contacts)
- **bdbb@test.com** → You see: Tini, Suvankar, Krish (3 contacts)
- **krish@test.com** → You see: Tini, Suvankar, bdbb (3 contacts)

## Test Steps

### Step 1: Start Backend

```bash
cd backend
npm run dev
```

Wait for:
```
✅ Server listening on 0.0.0.0:3000
📱 Access from:
   Network: http://172.25.255.16:3000
```

### Step 2: Verify Database Has Users

```bash
cd backend
npm run check-users
```

Should show:
```
Found 4 users:
- Tini (tini@test.com)
- Suvankar (suvankar@test.com)
- bdbb (bdbb@test.com)
- Krish (krish@test.com)
```

### Step 3: Test API Directly

```bash
# First login to get token
curl -X POST http://172.25.255.16:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tini@test.com\",\"password\":\"password123\"}"
```

Copy the token from response, then:

```bash
# Test contacts endpoint (replace YOUR_TOKEN)
curl http://172.25.255.16:3000/api/user/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return:
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Suvankar", "email": "suvankar@test.com", "avatar": "..." },
    { "_id": "...", "name": "bdbb", "email": "bdbb@test.com", "avatar": "..." },
    { "_id": "...", "name": "Krish", "email": "krish@test.com", "avatar": "..." }
  ]
}
```

### Step 4: Start Expo

```bash
cd frontend
npx expo start -c
```

### Step 5: Login and Verify

1. Open app on phone
2. Login with `tini@test.com` / `password123`
3. Home screen should show 3 contacts
4. Tap any contact to start chatting

## What You Should See

### On Home Screen:

**Direct Messages Tab:**
- ✅ Suvankar (with avatar)
- ✅ bdbb (with avatar)
- ✅ Krish (with avatar)

Each contact shows:
- Avatar image
- Name
- "Tap to start chatting" text
- Arrow icon on right

### If You See "No users available":

This means one of these issues:
1. Backend not running
2. Network connection failed
3. Token expired/invalid
4. Database is empty

## Debugging

### Check Backend Logs

When you login, backend should log:
```
[DEBUG] getContacts API: Request received
[DEBUG] Current user ID: ...
[DEBUG] Found 3 contacts (excluding current user)
[DEBUG] Contact names: Suvankar, bdbb, Krish
```

### Check Expo Logs

Frontend should log:
```
[ContactsService] Fetching from: http://172.25.255.16:3000/api/user/contacts
[ContactsService] API response success: true
[ContactsService] Cached 3 contacts
[DEBUG] Home: Loaded 3 contacts from cache
[DEBUG] API returned: 3 contacts
```

### Common Issues

**"Network request failed":**
- Backend not running
- Wrong IP address
- Not on same WiFi
- Firewall blocking

**"No contacts found":**
- Database empty (run `npm run seed`)
- All users deleted
- Only 1 user in database

**"Invalid credentials":**
- Wrong email/password
- Database not seeded
- User doesn't exist

## Test All Accounts

Try logging in with each account to verify:

```bash
# Account 1
Email: tini@test.com
Password: password123
Expected: See Suvankar, bdbb, Krish

# Account 2
Email: suvankar@test.com
Password: password123
Expected: See Tini, bdbb, Krish

# Account 3
Email: bdbb@test.com
Password: password123
Expected: See Tini, Suvankar, Krish

# Account 4
Email: krish@test.com
Password: password123
Expected: See Tini, Suvankar, bdbb
```

## Expected Behavior

✅ Login successful
✅ Navigate to home screen
✅ See "Loading..." briefly
✅ Contacts appear (3 users)
✅ Can tap any contact
✅ Opens chat screen
✅ Can send messages

## Files Involved

**Backend:**
- `backend/controller/user.controller.ts` - `getContacts()` function
- `backend/routes/user.routes.ts` - `/contacts` route
- `backend/middleware/auth.ts` - Token verification

**Frontend:**
- `frontend/app/(main)/home.tsx` - Home screen UI
- `frontend/services/contactsService.ts` - API calls
- `frontend/utils/network.ts` - Network config
- `frontend/context/authContext.tsx` - Auth state

## Success Criteria

When everything works:
- ✅ Login with any account
- ✅ See 3 other users immediately
- ✅ Each user has name and avatar
- ✅ Can tap to start chat
- ✅ Pull to refresh works
- ✅ Socket connection stable

---

**Your app is configured correctly. Just start the backend and Expo!**
