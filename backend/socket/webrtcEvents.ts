import { Server as SocketIOServer, Socket } from 'socket.io';
import Message from '../modals/Message.js';
import Conversation from '../modals/Conversation.js';

export function registerWebRTCEvents(io: SocketIOServer, socket: Socket) {
  // Join a call room (both caller and receiver join same roomId)
  socket.on('joinCallRoom', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`[WebRTC] ${userId} joined room ${roomId}`);

    // Count people in room
    const room = io.sockets.adapter.rooms.get(roomId);
    const count = room ? room.size : 0;
    console.log(`[WebRTC] Room ${roomId} now has ${count} people`);

    // When 2 people are in room, signal them to start
    if (count === 2) {
      io.to(roomId).emit('callRoomReady');
    }
  });

  // Forward WebRTC offer to the other person in the room
  socket.on('webrtcOffer', ({ roomId, offer }) => {
    console.log(`[WebRTC] Forwarding offer in room ${roomId}`);
    socket.to(roomId).emit('webrtcOffer', { offer });
  });

  // Forward WebRTC answer to the other person in the room
  socket.on('webrtcAnswer', ({ roomId, answer }) => {
    console.log(`[WebRTC] Forwarding answer in room ${roomId}`);
    socket.to(roomId).emit('webrtcAnswer', { answer });
  });

  // Forward ICE candidates
  socket.on('webrtcIce', ({ roomId, candidate }) => {
    socket.to(roomId).emit('webrtcIce', { candidate });
  });

  // End call room
  socket.on('endCallRoom', async ({ roomId, callData }) => {
    console.log(`[WebRTC] Ending room ${roomId}`);
    
    // Create call message if call data provided
    if (callData && callData.conversationId && callData.callerId) {
      try {
        const { conversationId, callerId, duration, callType, status } = callData;
        
        // Create call message
        const callMessage = await Message.create({
          conversationId,
          senderId: callerId,
          content: '', // Empty content for call messages
          isCallMessage: true,
          callData: {
            type: callType,
            duration: duration || 0,
            status: status || 'completed',
          },
        });

        // Populate sender info
        const populatedMessage = await Message.findById(callMessage._id)
          .populate('senderId', 'name avatar');

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: callMessage._id,
        });

        // Emit to all users in conversation
        io.to(roomId).emit('newCallMessage', {
          success: true,
          data: {
            id: populatedMessage._id,
            conversationId: populatedMessage.conversationId,
            sender: {
              id: (populatedMessage.senderId as any)._id,
              name: (populatedMessage.senderId as any).name,
              avatar: (populatedMessage.senderId as any).avatar,
            },
            content: populatedMessage.content,
            isCallMessage: populatedMessage.isCallMessage,
            callData: populatedMessage.callData,
            createdAt: populatedMessage.createdAt,
          },
        });

        console.log('[WebRTC] Call message created:', callMessage._id);
      } catch (err) {
        console.error('[WebRTC] Error creating call message:', err);
      }
    }
    
    io.to(roomId).emit('callEnded');
    socket.leave(roomId);
  });
}
