# Debug Google Avatar Issue

## What I Added

I've added extensive logging to track the avatar through the entire flow:

### 1. Auth Middleware (`backend/middleware/auth.ts`)
Logs when Clerk user is retrieved:
- Clerk user ID
- Email
- First name
- Username
- **imageUrl** (Google profile picture)
- **profileImageUrl** (alternative field)

### 2. Get Profile Endpoint (`backend/controller/user.controller.ts`)
Logs when user profile is fetched/created:
- Clerk user data received
- Avatar value and type
- Whether avatar is null/undefined
- Avatar being saved to MongoDB
- Avatar being returned to frontend

## How to Test

### Step 1: Start Backend with Logging
```bash
cd backend
npm start
```

Watch the console for logs starting with `[AUTH]` and `[DEBUG]`

### Step 2: Login with Google User

1. Open your app
2. Login with a Google account
3. Watch the backend console

### Step 3: Check the Logs

Look for these log sections:

#### Section 1: Auth Middleware
```
============================================================
[AUTH] Clerk user retrieved:
[AUTH]   - id: user_xxxxx
[AUTH]   - email: user@gmail.com
[AUTH]   - firstName: John
[AUTH]   - username: null
[AUTH]   - imageUrl: https://img.clerk.com/...
[AUTH]   - imageUrl type: string
[AUTH]   - profileImageUrl: https://img.clerk.com/...
============================================================
[AUTH] Set req.user.avatar to: https://img.clerk.com/...
```

**What to check:**
- Is `imageUrl` present?
- Is it a valid URL?
- Is `req.user.avatar` set correctly?

#### Section 2: Get Profile
```
============================================================
[DEBUG] getProfile: Clerk user data received:
[DEBUG]   - userId: user_xxxxx
[DEBUG]   - userEmail: user@gmail.com
[DEBUG]   - userName: John
[DEBUG]   - userAvatar: https://img.clerk.com/...
[DEBUG]   - userAvatar type: string
[DEBUG]   - userAvatar is null? false
[DEBUG]   - userAvatar is undefined? false
============================================================
```

**What to check:**
- Is `userAvatar` present?
- Is it the same URL from Section 1?
- Is it null or undefined?

#### Section 3: User Creation/Update
```
[DEBUG] getProfile: Creating new user from Clerk data
[DEBUG] getProfile: Will save avatar: https://img.clerk.com/...
[DEBUG] getProfile: User created successfully
[DEBUG] getProfile: Saved user._id: 507f1f77bcf86cd799439011
[DEBUG] getProfile: Saved user.avatar: https://img.clerk.com/...
```

OR

```
[DEBUG] getProfile: Found existing user: 507f1f77bcf86cd799439011
[DEBUG] getProfile: Current user.avatar: null
[DEBUG] getProfile: Clerk userAvatar: https://img.clerk.com/...
[DEBUG] getProfile: Updating avatar from null to https://img.clerk.com/...
[DEBUG] getProfile: User updated with Clerk data
[DEBUG] getProfile: New user.avatar: https://img.clerk.com/...
```

**What to check:**
- Is avatar being saved to MongoDB?
- Is the URL correct?

#### Section 4: Response
```
============================================================
[DEBUG] getProfile: Returning user data:
[DEBUG]   - id: 507f1f77bcf86cd799439011
[DEBUG]   - name: John
[DEBUG]   - email: user@gmail.com
[DEBUG]   - avatar: https://img.clerk.com/...
============================================================
```

**What to check:**
- Is avatar in the response?
- Is it the correct URL?

## Possible Issues & Solutions

### Issue 1: imageUrl is null in Clerk
**Symptom**: `[AUTH]   - imageUrl: null`

**Solution**: 
- Check Clerk Dashboard
- Go to Users → Select the user
- Check if profile image is set
- Google users should have automatic profile images

### Issue 2: Avatar not being saved to MongoDB
**Symptom**: `[DEBUG] getProfile: Saved user.avatar: null`

**Solution**:
- Check if `userAvatar` is null before saving
- Verify MongoDB connection
- Check user schema allows avatar field

### Issue 3: Avatar not in response
**Symptom**: `[DEBUG]   - avatar: null` in final response

**Solution**:
- Check if MongoDB saved it correctly
- Verify the query is returning the avatar field

### Issue 4: Frontend not displaying avatar
**Symptom**: Backend logs show avatar, but not displayed in app

**Solution**:
- Check frontend console logs
- Verify Avatar component is receiving the URL
- Check if image URL is accessible

## Next Steps

1. **Run the test** and copy the backend console logs
2. **Share the logs** with me
3. I'll identify exactly where the avatar is being lost
4. We'll fix the specific issue

## Quick Check

You can also manually check the database:

```bash
# Connect to MongoDB
mongo

# Use your database
use your_database_name

# Find a Google user
db.users.findOne({ email: "google_user@gmail.com" })

# Check if avatar field exists and has a value
```

The logs will tell us exactly what's happening!
