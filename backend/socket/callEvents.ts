import { Server as SocketIOServer, Socket } from 'socket.io';
import Call from '../modals/Call.js';
import { AccessToken } from 'livekit-server-sdk';

export function registerCallEvents(io: SocketIOServer, socket: Socket) {
  const userId = (socket as any).userId;

  // ─── INITIATE CALL ────────────────────────────────
  socket.on('initiateCall', async (data: {
    receiverId: string;
    callType: 'voice' | 'video';
    conversationId: string;
    callerName: string;
    callerAvatar: string;
    roomName: string;
    wsUrl: string;
  }) => {
    try {
      const { receiverId, callType, conversationId, callerName, callerAvatar, roomName, wsUrl } = data;

      // Generate LiveKit token for RECEIVER
      const apiKey = process.env.LIVEKIT_API_KEY!;
      const apiSecret = process.env.LIVEKIT_API_SECRET!;

      const receiverToken = new AccessToken(apiKey, apiSecret, {
        identity: `receiver-${receiverId}`,
        ttl: '1h',
      });

      receiverToken.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      });

      const receiverJwt = await receiverToken.toJwt();

      const call = await Call.create({
        callerId: userId,
        receiverId,
        conversationId,
        type: callType,
        status: 'missed',
        agoraChannel: roomName,
      });

      // Find receiver socket
      const allSockets = Array.from(io.sockets.sockets.values());
      const receiverSockets = allSockets.filter(
        (s) => (s as any).userId === receiverId
      );

      if (receiverSockets.length === 0) {
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

      // Notify receiver with their own token
      receiverSockets.forEach((s) => {
        s.emit('incomingCall', {
          callId: call._id,
          callerId: userId,
          callerName,
          callerAvatar,
          callType,
          roomName,
          token: receiverJwt,
          wsUrl,
          conversationId,
          receiverName,
        });
      });

      // Tell caller: call created
      socket.emit('callInitiated', {
        success: true,
        callId: call._id,
        roomName,
      });

      socket.emit('callResponse', { success: true });
    } catch (err: any) {
      console.error('[Call] initiateCall error:', err);
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
