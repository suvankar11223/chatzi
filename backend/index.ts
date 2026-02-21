import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import callRoutes from './routes/call.routes.js';
import { initializeSocket } from './socket/socket.js';
import os from 'os';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for Expo/React Native
app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Health check endpoint
app.get('/', (_req, res) => {
  res.send('Server is running');
});

// Endpoint to get server IP (for clients to discover the server's IP)
app.get('/api/discover', (_req, res) => {
  const ip = getLocalIP();
  const port = process.env.PORT || 3000;
  res.json({
    success: true,
    ip,
    port,
    url: `http://${ip}:${port}`
  });
});

// Mount auth routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/calls', callRoutes);

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({ success: false, msg: "Route not found" });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[DEBUG] Server error:', err);
  res.status(500).json({ success: false, msg: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Listen on all network interfaces (0.0.0.0) to allow connections from other devices
    server.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('SERVER STARTED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log('Server is running on Port', PORT);
      console.log('[DEBUG] Auth routes mounted at /api/auth');
      console.log('[DEBUG] User routes mounted at /api/user');
      console.log('[DEBUG] Socket.IO ready for connections');
      console.log('[DEBUG] Server accessible at:');
      console.log(`  - http://localhost:${PORT}`);
      console.log(`  - http://127.0.0.1:${PORT}`);
      console.log(`  - http://172.25.251.53:${PORT} (for physical devices on same network)`);
      console.log('='.repeat(60));
      console.log('IMPORTANT: Make sure your phone and computer are on the SAME WiFi network!');
      console.log('='.repeat(60));
    });
  } catch (err) {
    console.log('Failed to start the server due to database connection error:', err);
    process.exit(1);
  }
};

startServer();

export { io };
