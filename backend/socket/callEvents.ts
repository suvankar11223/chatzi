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
  }) => {
    try {
      const channelName = `call_${userId}_${Date.now()}`;

      const call = await Call.create({
        callerId: userId,
        receiverId: data.receiverId,
        conversationId: data.conversationId,
        type: data.callType,
        status: 'missed',
        agoraChannel: channelName,
      });

      // Find receiver socket
      const allSockets = Array.from(io.sockets.sockets.values());
      const receiverSockets = allSockets.filter(
        (s) => (s as any).userId === data.receiverId
      );

      if (receiverSockets.length === 0) {
        await Call.findByIdAndUpdate(call._id, { status: 'missed' });
        socket.emit('callResponse', {
          success: false,
          msg: 'User is offline',
        });
        return;
      }

      // Notify receiver
      receiverSockets.forEach((s) => {
        s.emit('incomingCall', {
          callId: call._id,
          callerId: userId,
          callerName: data.callerName,
          callerAvatar: data.callerAvatar,
          callType: data.callType,
          channelName,
          conversationId: data.conversationId,
        });
      });

      // Tell caller to join Agora
      socket.emit('callInitiated', {
        success: true,
        callId: call._id,
        channelName,
      });
    } catch (err: any) {
      socket.emit('callResponse', { success: false, msg: err.message });
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
