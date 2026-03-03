# 📱 Chatzi - Real-Time Chat & Video Calling App

## 🎯 Project Overview

**Chatzi** is a full-stack real-time messaging and video calling application built with React Native (Expo) for mobile and Node.js/Express for the backend. It features instant messaging, voice/video calls, online status tracking, and Google Sign-In authentication.

---

## 🏗️ Architecture

### Tech Stack

**Frontend (Mobile App)**
- React Native with Expo SDK 54
- TypeScript
- Expo Router (file-based routing)
- Socket.IO Client (real-time communication)
- Firebase Authentication
- Google Sign-In
- AsyncStorage (local caching)
- Axios (HTTP requests)

**Backend (Server)**
- Node.js with Express
- TypeScript
- Socket.IO (WebSocket server)
- MongoDB with Mongoose
- JWT Authentication
- Stream Chat SDK (optional integration)
- LiveKit (video calling infrastructure)

---

## ✨ Core Features

### 1. Authentication & User Management
- **Email/Password Registration & Login**
  - Secure password hashing with bcrypt
  - JWT token-based authentication
  - Token stored in AsyncStorage
  
- **Google Sign-In Integration** 🆕
  - Firebase Authentication
  - One-tap Google login
  - Automatic user profile creation
  - Seamless integration with existing auth flow

- **User Profile**
  - Avatar upload to Cloudinary
  - Name and email display
  - Profile editing
  - Logout functionality

### 2. Real-Time Messaging
- **Direct Messages (1-on-1)**
  - Instant message delivery via Socket.IO
  - Text messages
  - Image attachments (Cloudinary storage)
  - Message timestamps
  - Read receipts
  - Unread message badges
  - Optimistic UI updates

- **Group Chats**
  - Create groups with multiple participants
  - Group avatars
  - Group messaging
  - Participant management

- **Message Features**
  - Image sharing
  - Message history
  - Real-time typing indicators (ready to implement)
  - Message delivery status

### 3. Voice & Video Calls
- **Call Types**
  - Voice calls
  - Video calls
  - Direct calls only (1-on-1)

- **Call Features**
  - Incoming call notifications
  - Call accept/decline
  - Call duration tracking
  - Call history with status (completed/missed/declined)
  - Mute/unmute audio
  - Toggle camera on/off
  - Speaker mode
  - Call end detection

- **Call Infrastructure**
  - WebRTC-based calling
  - LiveKit integration
  - Agora SDK support
  - Socket.IO signaling
  - Room-based call management

### 4. Online Status & Presence
- **Real-Time Status**
  - Online/offline indicators
  - Green dot on avatars for online users
  - Socket-based presence tracking
  - Automatic status updates on connect/disconnect

- **Status Features**
  - Last seen timestamps (ready to implement)
  - Typing indicators (ready to implement)
  - Connection state management

### 5. Contacts & Conversations
- **Contact Management**
  - Automatic contact discovery (all registered users)
  - Contact list with avatars
  - Online status on contacts
  - Search contacts (ready to implement)

- **Conversation Management**
  - Conversation list sorted by recent activity
  - Last message preview
  - Unread count badges
  - Conversation creation
  - Direct and group conversations
  - Pull-to-refresh
  - Offline caching

---

## 🎨 User Interface

### Design System
- **Color Palette**
  - Primary: Blue (#007AFF)
  - Primary Light: Light Blue (#E6F4FE)
  - Neutral shades (100-900)
  - White/Black
  - Success/Error colors

- **Typography**
  - Custom Typo component
  - Font weights: 300-800
  - Sizes: 12-28px
  - Color variants

- **Spacing**
  - Consistent spacing scale (4-60px)
  - Horizontal (spacingX) and Vertical (spacingY)
  - Responsive scaling

- **Components**
  - Reusable UI components
  - Consistent styling
  - Accessibility support

### Screens

**Authentication Flow**
1. **Welcome Screen** - App introduction with logo
2. **Login Screen** - Email/password + Google Sign-In
3. **Register Screen** - Create account + Google Sign-In
4. **Server Config** - Optional server URL configuration

**Main App Flow**
1. **Home Screen**
   - Tab navigation (Direct Messages / Groups)
   - Conversation list with avatars
   - Unread badges
   - Online status indicators
   - Contact list (users without conversations)
   - Pull-to-refresh
   - Floating action button (create group)

2. **Conversation Screen**
   - Message list (inverted FlatList)
   - Message bubbles (sent/received)
   - Image messages
   - Call messages (special UI)
   - Input field with image picker
   - Voice/video call buttons
   - Online status in header
   - Back navigation

3. **Call Screen**
   - Full-screen video view
   - Local/remote video streams
   - Call controls (mute, camera, speaker, end)
   - Call duration timer
   - Participant info
   - Connection status

4. **Incoming Call Screen**
   - Full-screen modal
   - Caller info (name, avatar)
   - Accept/Decline buttons
   - Ringtone (ready to implement)

5. **Profile Modal**
   - User avatar
   - Name and email
   - Edit profile button
   - Logout button
   - Settings (ready to implement)

6. **New Conversation Modal**
   - Contact selection
   - Group creation
   - Search contacts

7. **Call History Screen**
   - List of past calls
   - Call type icons (voice/video)
   - Call status (completed/missed/declined)
   - Call duration
   - Timestamps
   - Tap to call back

### UI Components

**Reusable Components**
- `Avatar` - User/group avatars with online status
- `Button` - Primary action buttons with loading states
- `GoogleButton` - Google Sign-In button with branding
- `Input` - Text input with icons and validation
- `Typo` - Typography component with variants
- `Header` - Screen headers with left/right actions
- `BackButton` - Navigation back button
- `ScreenWrapper` - Screen container with gradient background
- `ConversationItem` - Conversation list item
- `MessageItem` - Message bubble with sender info
- `IncomingCallModal` - Incoming call UI
- `OutgoingCallModal` - Outgoing call UI
- `CallButtons` - Call control buttons

---

## 🔌 Real-Time Communication

### Socket.IO Events

**Connection Events**
- `connect` - Client connected
- `disconnect` - Client disconnected
- `userOnline` - User came online
- `userOffline` - User went offline

**Chat Events**
- `joinConversation` - Join a conversation room
- `getMessages` - Fetch message history
- `newMessage` - Send/receive new message
- `markAsRead` - Mark conversation as read
- `newConversation` - Create new conversation
- `getConversations` - Fetch conversation list

**Call Events**
- `initiateCall` - Start a call
- `callInitiated` - Call started successfully
- `incomingCall` - Receive incoming call
- `acceptCall` - Accept incoming call
- `declineCall` - Decline incoming call
- `endCall` - End active call
- `callEnded` - Call ended notification
- `newCallMessage` - Call history message

**User Events**
- `getContacts` - Fetch user contacts
- `getOnlineUsers` - Fetch online user list
- `updateOnlineStatus` - Update user status

---

## 📁 Project Structure

```
chat-app/
├── frontend/                    # React Native Expo app
│   ├── app/                     # Expo Router screens
│   │   ├── (auth)/             # Authentication screens
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── welcome.tsx
│   │   │   └── serverConfig.tsx
│   │   ├── (main)/             # Main app screens
│   │   │   ├── home.tsx
│   │   │   ├── Conversation.tsx
│   │   │   ├── callScreen.tsx
│   │   │   ├── incomingCall.tsx
│   │   │   ├── callHistory.tsx
│   │   │   ├── profileModal.tsx
│   │   │   └── newConversationModal.tsx
│   │   ├── _layout.tsx         # Root layout
│   │   └── index.tsx           # Entry point
│   ├── components/             # Reusable UI components
│   │   ├── call/              # Call-related components
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── GoogleButton.tsx
│   │   ├── Input.tsx
│   │   ├── Typo.tsx
│   │   └── ...
│   ├── context/               # React Context providers
│   │   ├── authContext.tsx    # Authentication state
│   │   └── callContext.tsx    # Call state
│   ├── services/              # API & service layers
│   │   ├── authService.ts     # Auth API calls
│   │   ├── googleAuthService.ts # Google Sign-In
│   │   ├── userService.ts     # User API calls
│   │   ├── callService.ts     # Call API calls
│   │   ├── contactsService.ts # Contacts API
│   │   ├── imageService.ts    # Cloudinary upload
│   │   └── webrtcService.ts   # WebRTC logic
│   ├── socket/                # Socket.IO client
│   │   ├── socket.ts          # Socket connection
│   │   └── socketEvents.ts    # Event handlers
│   ├── hooks/                 # Custom React hooks
│   │   └── useOnlineStatus.ts # Online status hook
│   ├── constants/             # App constants
│   │   ├── theme.ts           # Design tokens
│   │   ├── index.ts           # General constants
│   │   └── agora.ts           # Agora config
│   ├── utils/                 # Utility functions
│   │   ├── network.ts         # Network utilities
│   │   └── styling.ts         # Styling helpers
│   ├── types.ts               # TypeScript types
│   ├── app.json               # Expo configuration
│   ├── google-services.json   # Firebase config
│   └── package.json
│
├── backend/                    # Node.js Express server
│   ├── config/
│   │   └── db.ts              # MongoDB connection
│   ├── controller/            # Route controllers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   └── auth.ts            # JWT verification
│   ├── modals/                # Mongoose models
│   │   ├── userModal.ts
│   │   ├── Conversation.ts
│   │   ├── Message.ts
│   │   └── Call.ts
│   ├── routes/                # Express routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── call.routes.ts
│   │   └── livekit.routes.ts
│   ├── socket/                # Socket.IO server
│   │   ├── socket.ts          # Socket initialization
│   │   ├── chatEvents.ts      # Chat event handlers
│   │   ├── callEvents.ts      # Call event handlers
│   │   ├── userEvents.ts      # User event handlers
│   │   └── webrtcEvents.ts    # WebRTC signaling
│   ├── services/
│   │   └── streamService.ts   # Stream Chat integration
│   ├── utils/
│   │   └── token.ts           # JWT utilities
│   ├── public/
│   │   └── call.html          # Web call testing page
│   ├── index.ts               # Server entry point
│   ├── seed.ts                # Database seeding
│   ├── .env                   # Environment variables
│   └── package.json
│
└── Documentation files (.md)
```

---

## 🔐 Authentication Flow

### Email/Password Flow
1. User enters email and password
2. Frontend sends POST to `/api/auth/login` or `/api/auth/register`
3. Backend validates credentials
4. Backend generates JWT token
5. Frontend stores token in AsyncStorage
6. Frontend connects Socket.IO with token
7. User redirected to home screen

### Google Sign-In Flow 🆕
1. User taps "Continue with Google" button
2. Google Sign-In SDK opens Google account picker
3. User selects Google account
4. SDK returns ID token
5. Frontend sends ID token to Firebase Auth
6. Firebase validates and returns user data
7. Frontend sends user data to backend `/api/auth/google-signin`
8. Backend creates/updates user in MongoDB
9. Backend generates JWT token
10. Frontend stores token and connects Socket.IO
11. User redirected to home screen

---

## 🗄️ Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  avatar: string (Cloudinary URL),
  googleId: string (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Model
```typescript
{
  _id: ObjectId,
  type: 'direct' | 'group',
  name: string (for groups),
  avatar: string (for groups),
  participants: [ObjectId] (User refs),
  lastMessage: {
    _id: ObjectId,
    content: string,
    senderId: ObjectId,
    type: 'text' | 'image',
    attachment: string,
    createdAt: Date
  },
  unreadCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId (Conversation ref),
  sender: {
    id: ObjectId,
    name: string,
    avatar: string
  },
  content: string,
  attachment: string (Cloudinary URL),
  type: 'text' | 'image',
  isCallMessage: boolean,
  callData: {
    type: 'voice' | 'video',
    duration: number,
    status: 'completed' | 'missed' | 'declined'
  },
  createdAt: Date
}
```

### Call Model
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,
  callerId: ObjectId,
  receiverId: ObjectId,
  type: 'voice' | 'video',
  status: 'initiated' | 'ringing' | 'active' | 'completed' | 'missed' | 'declined',
  startTime: Date,
  endTime: Date,
  duration: number,
  roomId: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment variables**
Create `backend/.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/chatzi
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-livekit-url
```

3. **Seed database (optional)**
```bash
npm run seed
```

4. **Start server**
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure server URL**
Update `frontend/utils/network.ts`:
```typescript
export const SERVER_IP = 'YOUR_LOCAL_IP'; // e.g., '192.168.1.100'
export const SERVER_PORT = '3000';
```

3. **Configure Firebase (for Google Sign-In)**
- Create Firebase project at https://console.firebase.google.com
- Add Android app with package name `com.chatzi.app`
- Download `google-services.json` to `frontend/`
- Add SHA-1 fingerprint to Firebase Console
- Enable Google Sign-In in Authentication

4. **Start Expo development server**
```bash
npx expo start
```

5. **Run on device**
```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

### Building for Production

**Android APK**
```bash
cd frontend
npx expo prebuild --clean
eas build --profile development --platform android
```

**iOS IPA** (macOS only)
```bash
cd frontend
npx expo prebuild --clean
eas build --profile development --platform ios
```

---

## 🔧 Configuration

### Network Configuration
- Backend must be accessible from mobile device
- Use same WiFi network for development
- Update `SERVER_IP` in `frontend/utils/network.ts`
- Backend listens on `0.0.0.0` (all interfaces)

### Firebase Configuration
- Project ID: `bubbles-b2e10-5b9ce`
- Package name: `com.chatzi.app`
- Web Client ID: `460437326375-4ci97riqems0vn3r2htac2vfbulogjab.apps.googleusercontent.com`
- SHA-1 fingerprint: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`

### Call Configuration
- LiveKit or Agora SDK for video calls
- WebRTC for peer-to-peer connection
- Socket.IO for signaling
- STUN/TURN servers for NAT traversal

---

## 📊 Performance Optimizations

### Frontend
- **Offline Caching**: AsyncStorage for contacts and conversations
- **Optimistic UI**: Instant message updates before server confirmation
- **Image Optimization**: Compressed uploads to Cloudinary
- **Lazy Loading**: FlatList with inverted prop for messages
- **Memoization**: React.memo for expensive components
- **Connection Resilience**: Auto-reconnect on network changes

### Backend
- **Socket.IO Rooms**: Efficient message broadcasting
- **MongoDB Indexing**: Fast queries on user IDs and conversation IDs
- **JWT Tokens**: Stateless authentication
- **CORS Configuration**: Optimized for mobile clients
- **Error Handling**: Comprehensive error middleware

---

## 🐛 Known Issues & Limitations

### Current Limitations
- Group calls not implemented (only 1-on-1 calls)
- No message editing/deletion
- No message search
- No push notifications (local only)
- No end-to-end encryption
- No file sharing (only images)
- No voice messages
- No message reactions

### Planned Features
- Push notifications (FCM/APNs)
- Message search
- Message editing/deletion
- Group video calls
- Screen sharing
- File sharing
- Voice messages
- Message reactions
- Typing indicators
- Read receipts
- Last seen timestamps
- User blocking
- Report/abuse system

---

## 🔒 Security Considerations

### Implemented
- Password hashing with bcrypt
- JWT token authentication
- HTTPS for production (recommended)
- Input validation
- SQL injection prevention (Mongoose)
- XSS protection

### Recommended for Production
- Rate limiting
- CSRF protection
- Helmet.js for security headers
- Environment variable encryption
- Database encryption at rest
- SSL/TLS certificates
- API key rotation
- User session management
- Two-factor authentication
- OAuth 2.0 best practices

---

## 📱 Supported Platforms

- ✅ Android 5.0+ (API 21+)
- ✅ iOS 13.0+
- ⚠️ Web (limited support, no calls)

---

## 🤝 Contributing

This is a personal project, but contributions are welcome!

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Developer Notes

### Debugging
- Enable debug logs in `frontend/utils/network.ts`
- Check Socket.IO connection in browser DevTools
- Use `console.log` statements (search for `[DEBUG]`)
- Monitor MongoDB queries
- Check backend logs for errors

### Testing
- Test on real devices (not just emulator)
- Test on different network conditions
- Test with multiple users simultaneously
- Test call scenarios (accept, decline, missed)
- Test offline/online transitions

### Deployment
- Use environment variables for secrets
- Configure CORS for production domains
- Set up MongoDB Atlas for production
- Use CDN for static assets
- Enable compression middleware
- Set up monitoring (Sentry, LogRocket)
- Configure analytics (Firebase, Mixpanel)

---

## 📞 Support

For issues or questions:
- Check documentation files in project root
- Review code comments
- Check console logs for errors
- Verify network configuration
- Ensure all dependencies are installed

---

## 🎉 Acknowledgments

Built with:
- React Native & Expo
- Socket.IO
- MongoDB & Mongoose
- Firebase Authentication
- LiveKit/Agora for video calls
- Cloudinary for image storage
- Stream Chat SDK

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Active Development

---

## 🚦 Quick Start Checklist

### First Time Setup
- [ ] Install Node.js 18+
- [ ] Install MongoDB
- [ ] Clone repository
- [ ] Install backend dependencies
- [ ] Configure backend `.env`
- [ ] Start MongoDB
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Update `SERVER_IP` in frontend
- [ ] Configure Firebase project
- [ ] Download `google-services.json`
- [ ] Add SHA-1 to Firebase
- [ ] Start Expo dev server
- [ ] Run on device/emulator
- [ ] Create test accounts
- [ ] Test messaging
- [ ] Test calls
- [ ] Test Google Sign-In

### Daily Development
- [ ] Start MongoDB
- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `npx expo start`
- [ ] Check server IP matches
- [ ] Verify Socket.IO connection
- [ ] Test new features
- [ ] Check logs for errors

---

**Happy Coding! 🚀**
