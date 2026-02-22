import { Server as SocketIOServer, Socket } from 'socket.io';
import Call from '../modals/Call.js';

export function registerCallEvents(io: SocketIOServer, socket: Socket) {
  const userId = (socket as any).userId;

  // ─── INITIATE CALL ────────────────────────────────
  socket.on('initiateCall', async (data: {
    receiverId: string;
    callType: 'voice' | 'video';
    conversationId: string;
    callerName: string;
    callerAvatar: string;
    roomId: string;
  }) => {
    try {
      console.log('[Call] ========== INITIATE CALL ==========');
      console.log('[Call] Caller ID:', userId);
      console.log('[Call] Receiver ID:', data.receiverId);
      console.log('[Call] Call Type:', data.callType);
      console.log('[Call] Room ID:', data.roomId);
      
      const { receiverId, callType, conversationId, callerName, callerAvatar, roomId } = data;

      const call = await Call.create({
        callerId: userId,
        receiverId,
        conversationId,
        type: callType,
        status: 'missed',
        agoraChannel: roomId,
      });

      console.log('[Call] Call created in DB:', call._id);

      // Find receiver socket
      const allSockets = Array.from(io.sockets.sockets.values());
      console.log('[Call] Total connected sockets:', allSockets.length);
      
      // Log all connected user IDs
      const connectedUserIds = allSockets.map(s => (s as any).userId).filter(Boolean);
      console.log('[Call] Connected user IDs:', connectedUserIds);
      
      const receiverSockets = allSockets.filter(
        (s) => (s as any).userId === receiverId
      );

      console.log('[Call] Receiver sockets found:', receiverSockets.length);

      if (receiverSockets.length === 0) {
        console.log('[Call] ❌ Receiver is offline');
        await Call.findByIdAndUpdate(call._id, { status: 'missed' });
        socket.emit('callResponse', {
          success: false,
          msg: 'User is offline',
        });
        return;
      }

      // Get receiver's name
      const User = (await import('../modals/userModal.js')).default;
      const receiver = await User.findById(receiverId);
      const receiverName = receiver?.name || 'You';

      console.log('[Call] Receiver name:', receiverName);

      // Notify receiver
      const incomingCallData = {
        callId: call._id,
        callerId: userId,
        callerName,
        callerAvatar,
        callType,
        roomId,
        conversationId,
        receiverName,
      };
      
      console.log('[Call] Emitting incomingCall event with data:', incomingCallData);
      
      receiverSockets.forEach((s, index) => {
        console.log(`[Call] Emitting to receiver socket ${index + 1}/${receiverSockets.length}, socket ID:`, s.id);
        s.emit('incomingCall', incomingCallData);
      });

      console.log('[Call] ✅ incomingCall event sent to all receiver sockets');

      // Tell caller: call created
      socket.emit('callInitiated', {
        success: true,
        callId: call._id,
        roomId,
      });

      socket.emit('callResponse', { success: true });
      console.log('[Call] ========== INITIATE CALL COMPLETE ==========');
    } catch (err: any) {
      console.error('[Call] ❌ initiateCall error:', err);
      socket.emit('callResponse', { success: false, msg: 'Server error' });
    }
  });

  // ─── ANSWER CALL ──────────────────────────────────
  socket.on('answerCall', async (data: {
    callId: string;
    callerId: string;
  }) => {
    try {
      const call = await Call.findByIdAndUpdate(
        data.callId,
        { status: 'completed', startedAt: new Date() },
        { new: true }
      );

      const allSockets = Array.from(io.sockets.sockets.values());
      allSockets
        .filter((s) => (s as any).userId === data.callerId)
        .forEach((s) => {
          s.emit('callAnswered', {
            success: true,
            callId: data.callId,
            channelName: call?.agoraChannel,
          });
        });
    } catch (err: any) {
      console.error('[Call] answerCall error:', err);
    }
  });

  // ─── DECLINE CALL ─────────────────────────────────
  socket.on('declineCall', async (data: {
    callId: string;
    callerId: string;
  }) => {
    try {
      await Call.findByIdAndUpdate(data.callId, { status: 'declined' });

      const allSockets = Array.from(io.sockets.sockets.values());
      allSockets
        .filter((s) => (s as any).userId === data.callerId)
        .forEach((s) => s.emit('callDeclined', { callId: data.callId }));
    } catch (err: any) {
      console.error('[Call] declineCall error:', err);
    }
  });

  // ─── END CALL ─────────────────────────────────────
  socket.on('endCall', async (data: {
    callId: string;
    otherUserId: string;
  }) => {
    try {
      const call = await Call.findById(data.callId);
      if (!call) return;

      const duration = call.startedAt
        ? Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
        : 0;

      await Call.findByIdAndUpdate(data.callId, {
        endedAt: new Date(),
        duration,
      });

      const allSockets = Array.from(io.sockets.sockets.values());
      allSockets
        .filter((s) => (s as any).userId === data.otherUserId)
        .forEach((s) => s.emit('callEnded', { callId: data.callId, duration }));
    } catch (err: any) {
      console.error('[Call] endCall error:', err);
    }
  });
}
