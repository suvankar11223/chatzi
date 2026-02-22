# Fix: Missing Contact Names

## Problem
Contact names were not showing in the Direct Messages list - only "Tap to start chatting" was visible.

## Root Cause
The `item.name` property was undefined or empty for some contacts, causing the name to not render.

## Solution Applied

### File: `frontend/app/(main)/home.tsx`

**Before:**
```typescript
<Typo size={16} fontWeight="600" color={colors.neutral900}>
  {item.name}
</Typo>
```

**After:**
```typescript
<Typo size={16} fontWeight="600" color={colors.neutral900}>
  {item.name || item.email || 'Unknown User'}
</Typo>
```

**Fallback Chain:**
1. Try `item.name` first
2. If empty, try `item.email`
3. If still empty, show 'Unknown User'

## Additional Debugging

Added console logging to see what data is in contacts:
```typescript
if (contactsWithoutConversation.length > 0) {
  console.log('[DEBUG] Contacts without conversation:', 
    contactsWithoutConversation.map(c => ({ 
      id: c._id, 
      name: c.name, 
      email: c.email 
    }))
  );
}
```

## Testing

1. Restart Expo with cache clear:
   ```bash
   cd frontend
   npx expo start -c
   ```

2. Login and check Direct Messages tab

3. You should now see:
   - Contact name (if available)
   - OR email (if name is missing)
   - OR "Unknown User" (if both are missing)

## Check Backend Data

If names are still missing, verify the backend is returning proper data:

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

If names are missing in database, reseed:
```bash
cd backend
npm run seed
```

## Expected Result

**Before:**
```
[Avatar] 
         Tap to start chatting
```

**After:**
```
[Avatar] Krish
         Tap to start chatting
```

Or if name is missing:
```
[Avatar] krish@test.com
         Tap to start chatting
```

## Check Expo Logs

Look for this debug output:
```
[DEBUG] Contacts without conversation: [
  { id: "...", name: "Krish", email: "krish@test.com" }
]
```

If `name` is null/undefined in the logs, the issue is with the backend data.
