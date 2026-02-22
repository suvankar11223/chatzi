import { Server as SocketIOServer, Socket } from 'socket.io';

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
  socket.on('endCallRoom', ({ roomId }) => {
    console.log(`[WebRTC] Ending room ${roomId}`);
    io.to(roomId).emit('callEnded');
    socket.leave(roomId);
  });
}
