# Google Users Visibility Debug Guide

## Problem
Two Google users cannot see each other on home screen despite being in database.

## Users Confirmed in Database
- Suvankar (sangha.nayak18@gmail.com) - ID: 69a469aca3c5f65b436029dc
- AMAN (amanzade9158@gmail.com) - ID: 69a69f45909a5fb354f12d8b

## All Fixes Applied

### 1. Token Refresh (authContext.tsx)
- Always get fresh token with skipCache: true
- Store token in AsyncStorage immediately
- Added refreshToken helper function

### 2. Show All Contacts (home.tsx)
- Changed from showing only first contact to ALL contacts
- Line 295: contactsToShow = contactsWithoutConversation

### 3. Handle Token Expiration (contactsService.ts)
- Read fresh token from AsyncStorage before API calls
- Return cached data on 401 errors
- Added detailed logging

### 4. Global IO Instance (index.ts)
- Set global.io so controllers can broadcast
- Line 107: (global as any).io = io

## Testing Steps

### 1. Check Backend Logs
Start backend and watch for:
```
[DEBUG] getProfile: Clerk user data received
[DEBUG] getProfile: Broadcasted new user to all clients
[Socket] Broadcasted user to all clients
```

### 2. Check Frontend Logs
Watch for:
```
[ContactsService] Got X contacts from API
[ContactsService] Contact names: ...
[DEBUG] Total contacts: X
[DEBUG] All contact names: ...
```

### 3. Test Procedure
1. User A logs in - check backend broadcasts
2. User B logs in - check if A receives event
3. Pull to refresh - check if contacts load
4. Check API response at /api/user/contacts

## Files Modified
- backend/index.ts
- frontend/context/authContext.tsx  
- frontend/app/(main)/home.tsx
- frontend/services/contactsService.ts

## Next Action
Test with both Google users logged in and check logs.
