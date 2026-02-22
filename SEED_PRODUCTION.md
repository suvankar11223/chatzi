# Seed Production Database

Your production backend on Render is connected to MongoDB but the database is empty.

## Quick Fix

Run this command to seed the production database:

```bash
cd backend
npm run seed
```

This will:
- Connect to your MongoDB Atlas database
- Delete any existing users
- Create 4 test users:
  - tini@test.com / password123
  - suvankar@test.com / password123
  - bdbb@test.com / password123
  - krish@test.com / password123

## After Seeding

1. Restart your Expo app with cache clear:
   ```bash
   cd frontend
   npx expo start -c
   ```

2. Login with any test account (e.g., tini@test.com / password123)

3. You should now see the other 3 users in your contacts list

## Verify It Worked

Run this to test:
```bash
node test-production.js
```

You should see:
- ✅ Health check: success
- ✅ Login successful
- ✅ Contacts fetched: 3 users

## Note

The same MongoDB database is used by:
- Your local backend (when running locally)
- Your Render production backend

So seeding once will populate both environments.
