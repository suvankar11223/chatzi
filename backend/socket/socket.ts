import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import { registerUserEvents } from './userEvents.js';
import { registerChatEvents } from './chatEvents.js';
import { registerCallEvents } from './callEvents.js';
import Conversation from '../modals/Conversation';

dotenv.config();

export const initializeSocket = (server: Server): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'], // Try websocket first
    allowEIO3: true, // Allow Engine.IO v3 clients
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log("[DEBUG] Socket: No token provided");
      return next(new Error("Authentication error: no token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      
      // Attach user info to socket
      (socket as any).userId = (decoded as any).userId;
      (socket as any).userEmail = (decoded as any).email;
      
      console.log("[DEBUG] Socket: User authenticated:", (decoded as any).email);
      next();
    } catch (err: any) {
      console.log("[DEBUG] Socket: Token verification failed:", err.message);
      return next(new Error("Authentication error: invalid token"));
    }
  });

  // Connection handler
  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    const userEmail = (socket as any).userEmail;
    
    console.log(`[DEBUG] Socket: User connected - ${userEmail} (${socket.id})`);

    // Join user to their own personal room for direct messaging
    socket.join(userId);

    // CRITICAL FIX: Rejoin all conversation rooms on connection/reconnection
    try {
      const userConversations = await Conversation.find({
        participants: userId
      }).select('_id');

      userConversations.forEach((conv: any) => {
        socket.join(conv._id.toString());
        console.log(`[DEBUG] Socket: User ${userId} rejoined conversation ${conv._id}`);
      });
      
      console.log(`[DEBUG] Socket: User ${userId} rejoined ${userConversations.length} conversation rooms`);
    } catch (error) {
      console.error("[DEBUG] Socket: Error rejoining conversations:", error);
    }

    // Register user-specific events
    registerUserEvents(io, socket);
    registerChatEvents(io, socket);
    registerCallEvents(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[DEBUG] Socket: User disconnected - ${userEmail} (${socket.id})`);
      
      // Broadcast user offline status
      io.emit("userStatusChanged", {
        userId,
        status: "offline",
        timestamp: new Date(),
      });
    });

    // Handle explicit reconnection event from client
    socket.on('rejoinConversations', async () => {
      console.log(`[DEBUG] Socket: User ${userId} requesting to rejoin all conversations`);
      try {
        const userConversations = await Conversation.find({
          participants: userId
        }).select('_id');

        userConversations.forEach((conv: any) => {
          socket.join(conv._id.toString());
        });
        
        socket.emit('rejoinedConversations', {
          success: true,
          count: userConversations.length
        });
      } catch (error) {
        socket.emit('rejoinedConversations', {
          success: false,
          msg: 'Failed to rejoin conversations'
        });
      }
    });
  });

  console.log('[DEBUG] Socket.IO initialized successfully');
  return io;
};
