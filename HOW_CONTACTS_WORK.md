# 📱 How Contacts Work - Simple Explanation

## ✅ It Already Works!

Your app is configured to fetch contacts automatically when you login. Here's how:

## Flow Diagram

```
1. User logs in (tini@test.com)
   ↓
2. Gets JWT token
   ↓
3. Navigates to Home screen
   ↓
4. Home screen calls: GET /api/user/contacts
   ↓
5. Backend returns all users EXCEPT tini
   ↓
6. Shows: Suvankar, bdbb, Krish
```

## What Happens in Code

### Backend (`backend/controller/user.controller.ts`)

```typescript
export const getContacts = async (req, res) => {
  const currentUserId = req.user.userId; // From JWT token
  
  // Get ALL users EXCEPT current user
  const users = await User.find({ 
    _id: { $ne: currentUserId } 
  });
  
  res.json({ success: true, data: users });
}
```

### Frontend (`frontend/app/(main)/home.tsx`)

```typescript
useEffect(() => {
  // Load cached contacts instantly
  loadCachedData();
  
  // Fetch fresh contacts from API
  fetchFreshData();
  
  // Setup socket for real-time updates
  setupSocketListeners();
}, []);
```

## Example

**Login as tini@test.com:**
```
Request: GET /api/user/contacts
Headers: Authorization: Bearer <tini's token>

Response:
{
  "success": true,
  "data": [
    { "_id": "1", "name": "Suvankar", "email": "suvankar@test.com" },
    { "_id": "2", "name": "bdbb", "email": "bdbb@test.com" },
    { "_id": "3", "name": "Krish", "email": "krish@test.com" }
  ]
}
```

**Login as suvankar@test.com:**
```
Request: GET /api/user/contacts
Headers: Authorization: Bearer <suvankar's token>

Response:
{
  "success": true,
  "data": [
    { "_id": "0", "name": "Tini", "email": "tini@test.com" },
    { "_id": "2", "name": "bdbb", "email": "bdbb@test.com" },
    { "_id": "3", "name": "Krish", "email": "krish@test.com" }
  ]
}
```

## Features Already Implemented

✅ **Automatic Fetch** - Contacts load on login
✅ **Caching** - Shows cached contacts instantly
✅ **Background Refresh** - Fetches fresh data
✅ **Pull to Refresh** - Swipe down to reload
✅ **Real-time Updates** - Socket.IO for live changes
✅ **Error Handling** - Retries on failure
✅ **Loading States** - Shows "Loading..." while fetching

## Test It

1. Start backend: `cd backend && npm run dev`
2. Start Expo: `cd frontend && npx expo start -c`
3. Login with: `tini@test.com` / `password123`
4. See 3 contacts: Suvankar, bdbb, Krish

## Different Accounts See Different Contacts

| Login As | Sees |
|----------|------|
| tini@test.com | Suvankar, bdbb, Krish |
| suvankar@test.com | Tini, bdbb, Krish |
| bdbb@test.com | Tini, Suvankar, Krish |
| krish@test.com | Tini, Suvankar, bdbb |

## Why It Works

The backend uses the JWT token to identify who you are:

```typescript
// JWT token contains: { userId: "123", email: "tini@test.com" }
// Backend extracts userId from token
// Returns all users WHERE _id != "123"
```

So you NEVER see yourself in the contacts list!

## No Configuration Needed

Everything is already set up:
- ✅ Backend endpoint: `/api/user/contacts`
- ✅ Frontend service: `contactsService.ts`
- ✅ Home screen: Fetches on mount
- ✅ Auth middleware: Validates token
- ✅ Database: Seeded with 4 users

## Just Start and Login!

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npx expo start -c
```

Then login with any account and you'll see the other users automatically! 🎉
