# Chatzi - Real-time Chat Application

A full-stack real-time chat application built with React Native (Expo), Node.js, Socket.IO, and MongoDB.

## Features

- 🔐 User authentication (register/login)
- 💬 Real-time messaging with Socket.IO
- 📸 Image sharing with Cloudinary
- 👥 Direct messages and group chats
- 📞 Video/audio calling (WebRTC)
- 🔔 Real-time notifications
- 📱 Cross-platform (iOS & Android)

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- Socket.IO Client
- React Navigation

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (image storage)

## Project Structure

```
chatzi/
├── backend/          # Node.js backend
│   ├── config/       # Database configuration
│   ├── controller/   # Route controllers
│   ├── middleware/   # Auth middleware
│   ├── modals/       # Mongoose models
│   ├── routes/       # API routes
│   ├── socket/       # Socket.IO events
│   └── index.ts      # Entry point
│
└── frontend/         # React Native app
    ├── app/          # Screens (Expo Router)
    ├── components/   # Reusable components
    ├── constants/    # Theme & config
    ├── context/      # React Context
    ├── services/     # API services
    └── socket/       # Socket.IO client
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB
- Expo CLI
- Cloudinary account

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   PORT=3000
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update server URL in `frontend/constants/index.ts`:
   ```typescript
   export const API_URL = "http://YOUR_IP:3000/api";
   ```

4. Start Expo:
   ```bash
   npx expo start
   ```

5. Scan QR code with Expo Go app

## Deployment

See `DEPLOY_NOW.md` for instructions on deploying to Render.com or Railway.app.

## License

MIT
