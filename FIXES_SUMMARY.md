# Google Users Visibility - Fixes Applied

## Problem
Two Google users cannot see each other on home screen.

## Fixes Applied

### 1. Token Refresh (authContext.tsx)
- Always use `getToken({ skipCache: true })`
- Store token in AsyncStorage immediately
- Added refreshToken helper function

### 2. Show All Contacts (home.tsx)
- Changed from showing only first contact to ALL contacts
- Line 295: `contactsToShow = contactsWithoutConversation`

### 3. Better Error Handling (contactsService.ts)
- Read fresh token from AsyncStorage before API calls
- Handle 401 errors gracefully
- Enhanced logging with full error responses

### 4. Global IO Instance (index.ts)
- Set `(global as any).io = io` for broadcasting

### 5. Enhanced Logging
- Added detailed logs throughout the flow
- Log contact names, IDs, and counts
- Log API responses and errors

## Testing

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm start
```

### Test Steps
1. Login as User A (Suvankar)
2. Login as User B (AMAN) on another device
3. Pull to refresh on both devices
4. Check logs for contacts loading

### Expected Logs

Backend:
```
[DEBUG] getContacts API: Found X contacts
[DEBUG] Contact names: ...
[Socket] Broadcasted user to all clients
```

Frontend:
```
[ContactsService] Got X contacts from API
[ContactsService] Contact names: ...
[DEBUG] Total contacts: X
```

## Files Modified
- backend/index.ts
- frontend/context/authContext.tsx
- frontend/app/(main)/home.tsx
- frontend/services/contactsService.ts

## Status
✅ All fixes applied
⏳ Ready for testing
