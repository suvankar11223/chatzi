# Deploy Backend to Render.com - Step by Step Guide

## Prerequisites
✅ Code pushed to GitHub: https://github.com/suvankar11223/chatzi
✅ MongoDB Atlas account (for database)
✅ Cloudinary account (for images)

---

## Part 1: Setup MongoDB Atlas (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or Email
3. Choose "Free" tier (M0 Sandbox)
4. Click "Create"

### Step 2: Create Database
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select region closest to you (e.g., AWS / N. Virginia)
4. Click "Create Cluster"
5. Wait 1-3 minutes for cluster to be created

### Step 3: Create Database User
1. You'll see "Security Quickstart"
2. Create a username: `chatzi-admin`
3. Create a password: Click "Autogenerate Secure Password" and COPY IT
4. Click "Create User"

### Step 4: Add IP Address
1. In "Where would you like to connect from?"
2. Click "Add My Current IP Address"
3. Also click "Add a Different IP Address"
4. Enter: `0.0.0.0/0` (allows access from anywhere)
5. Description: "Allow all"
6. Click "Add Entry"
7. Click "Finish and Close"

### Step 5: Get Connection String
1. Click "Connect" button on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string (looks like):
   ```
   mongodb+srv://chatzi-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you copied earlier
6. Add database name before the `?`:
   ```
   mongodb+srv://chatzi-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chatzi?retryWrites=true&w=majority
   ```
7. SAVE THIS - you'll need it for Render!

---

## Part 2: Deploy to Render.com (10 minutes)

### Step 1: Create Render Account
1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. You'll see "Create a new Web Service"

### Step 3: Connect Repository
1. Find your repository: `suvankar11223/chatzi`
2. Click "Connect" next to it
3. If you don't see it, click "Configure account" and give Render access

### Step 4: Configure Service Settings

Fill in these fields:

**Name:**
```
chatzi-backend
```

**Region:**
```
Oregon (US West) or closest to you
```

**Branch:**
```
main
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Instance Type:**
```
Free
```

### Step 5: Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these one by one:

1. **MONGODB_URI**
   ```
   mongodb+srv://chatzi-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chatzi?retryWrites=true&w=majority
   ```
   (Use the connection string from MongoDB Atlas)

2. **JWT_SECRET**
   ```
   your-super-secret-jwt-key-change-this-in-production-12345
   ```
   (Or generate a random string)

3. **CLOUDINARY_CLOUD_NAME**
   ```
   your_cloudinary_cloud_name
   ```
   (From your Cloudinary dashboard)

4. **CLOUDINARY_API_KEY**
   ```
   your_cloudinary_api_key
   ```

5. **CLOUDINARY_API_SECRET**
   ```
   your_cloudinary_api_secret
   ```

6. **PORT**
   ```
   3000
   ```

### Step 6: Create Web Service
1. Scroll down
2. Click "Create Web Service"
3. Wait 3-5 minutes for deployment

### Step 7: Monitor Deployment
You'll see logs like:
```
==> Cloning from https://github.com/suvankar11223/chatzi...
==> Checking out commit abc123...
==> Running build command 'npm install && npm run build'...
==> Build successful!
==> Starting service with 'npm start'...
==> Your service is live 🎉
```

### Step 8: Get Your URL
1. Once deployed, you'll see: "Your service is live at https://chatzi-backend.onrender.com"
2. COPY THIS URL!
3. Test it by visiting: `https://chatzi-backend.onrender.com/api/auth/test`
4. You should see: `{"success":true,"message":"Server is reachable"}`

---

## Part 3: Update Frontend (2 minutes)

### Update Constants File

Open `frontend/constants/index.ts` and replace ALL URLs:

```typescript
// Replace this line (appears 4 times):
"http://172.25.251.53:3000/api"

// With your Render URL:
"https://chatzi-backend.onrender.com/api"
```

### Update Socket File

Open `frontend/socket/socket.ts` and replace:

```typescript
// Replace this line:
return "http://172.25.251.53:3000";

// With your Render URL (no /api):
return "https://chatzi-backend.onrender.com";
```

### Commit and Push Changes

```bash
git add .
git commit -m "Update URLs to use Render deployment"
git push origin main
```

---

## Part 4: Test Your App! (1 minute)

1. **Reload your app** (shake device → Reload)
2. **Register a new account** or login
3. **Contacts should load immediately**
4. **Send messages** - they should work instantly
5. **Share with friends** - they can use it from anywhere!

---

## Troubleshooting

### "Service Unavailable" Error
- Wait 30-60 seconds (free tier services sleep after inactivity)
- First request wakes it up
- Subsequent requests are instant

### "Cannot connect to MongoDB"
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string has correct password
- Make sure database name is included in URL

### Build Failed
- Check Render logs for specific error
- Common issue: Missing dependencies in package.json
- Make sure `tsconfig.json` exists in backend folder

### Environment Variables Not Working
- Double-check spelling (case-sensitive)
- No quotes needed in Render dashboard
- Click "Save Changes" after adding variables

---

## Important Notes

### Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month (enough for 24/7 usage)
- Automatic HTTPS included

### Keeping Service Awake (Optional)
Use a service like UptimeRobot to ping your URL every 5 minutes:
1. Go to: https://uptimerobot.com
2. Add monitor: `https://chatzi-backend.onrender.com/api/auth/test`
3. Check interval: 5 minutes
4. Your service will never sleep!

### Upgrading to Paid Plan
If you need:
- No sleep time
- More resources
- Custom domain
- Upgrade to Starter plan ($7/month)

---

## Success! 🎉

Your app is now deployed and accessible from anywhere in the world!

**Your Backend URL:** https://chatzi-backend.onrender.com

**What works now:**
✅ Permanent URL (never changes)
✅ Works from any WiFi/mobile data
✅ Friends can use it immediately
✅ Professional and reliable
✅ Automatic HTTPS
✅ No more IP address issues

**Next Steps:**
- Share your app with friends
- They just need to scan your Expo QR code
- Everyone can chat from anywhere!

---

## Need Help?

If you get stuck:
1. Check Render logs (click "Logs" tab)
2. Check MongoDB Atlas connection
3. Verify environment variables are correct
4. Test backend URL in browser: `https://your-url.onrender.com/api/auth/test`

Happy chatting! 💬
