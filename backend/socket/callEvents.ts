import { Server as SocketIOServer, Socket } from "socket.io";
import Call from "../modals/Call.js";
import mongoose from "mongoose";

// ICE server configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    // Add TURN servers here for production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
};

// Store active calls
const activeCalls = new Map<string, {
  callId: string;
  callerId: string;
  calleeId: string;
  type: "audio" | "video";
}>();

export const registerCallEvents = (io: SocketIOServer, socket: Socket) => {
  const userId = (socket as any).userId;

  // Get call history for a user
  socket.on("getCallHistory", async (data: { limit?: number; offset?: number }, callback) => {
    try {
      const limit = data.limit || 20;
      const offset = data.offset || 0;

      const calls = await Call.find({
        $or: [{ callerId: userId }, { calleeId: userId }],
      })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate("callerId", "name avatar email")
        .populate("calleeId", "name avatar email")
        .populate("conversationId", "name avatar");

      const total = await Call.countDocuments({
        $or: [{ callerId: userId }, { calleeId: userId }],
      });

      callback({
        success: true,
        data: calls,
        total,
      });
    } catch (error) {
      console.error("[DEBUG] Call: Error getting call history:", error);
      callback({
        success: false,
        msg: "Failed to get call history",
      });
    }
  });

  // Initiate a call
  socket.on("initiateCall", async (data: {
    calleeId: string;
    type: "audio" | "video";
    conversationId?: string;
  }, callback) => {
    try {
      console.log("[DEBUG] Call: Initiating call from", userId, "to", data.calleeId);

      // Check if callee is online
      const calleeSocketIds = io.sockets.adapter.rooms.get(data.calleeId);
      const isCalleeOnline = calleeSocketIds && calleeSocketIds.size > 0;

      // Create call record
      const call = new Call({
        callerId: userId,
        calleeId: data.calleeId,
        conversationId: data.conversationId ? new mongoose.Types.ObjectId(data.conversationId) : undefined,
        type: data.type,
        status: isCalleeOnline ? "ringing" : "initiated",
      });
      await call.save();

      // Store active call
      activeCalls.set(call._id.toString(), {
        callId: call._id.toString(),
        callerId: userId,
        calleeId: data.calleeId,
        type: data.type,
      });

      // Notify callee
      io.to(data.calleeId).emit("incomingCall", {
        callId: call._id.toString(),
        callerId: userId,
        type: data.type,
        conversationId: data.conversationId,
        timestamp: new Date(),
      });

      // Notify caller about the status
      callback({
        success: true,
        callId: call._id.toString(),
        status: call.status,
        iceServers: ICE_SERVERS,
      });

      // If callee is not online, mark as missed after a timeout
      if (!isCalleeOnline) {
        setTimeout(async () => {
          const activeCall = activeCalls.get(call._id.toString());
          if (activeCall) {
            call.status = "missed";
            await call.save();
            activeCalls.delete(call._id.toString());
            
            // Notify caller
            io.to(userId).emit("callStatusChanged", {
              callId: call._id.toString(),
              status: "missed",
            });
          }
        }, 30000); // 30 seconds timeout
      }
    } catch (error) {
      console.error("[DEBUG] Call: Error initiating call:", error);
      callback({
        success: false,
        msg: "Failed to initiate call",
      });
    }
  });

  // Accept a call
  socket.on("acceptCall", async (data: { callId: string }, callback) => {
    try {
      console.log("[DEBUG] Call: Accepting call", data.callId);

      const call = await Call.findById(data.callId);
      if (!call) {
        return callback({
          success: false,
          msg: "Call not found",
        });
      }

      // Update call status
      call.status = "connected";
      call.startTime = new Date();
      await call.save();

      // Notify caller
      io.to(call.callerId.toString()).emit("callAccepted", {
        callId: call._id.toString(),
        calleeId: userId,
        iceServers: ICE_SERVERS,
      });

      callback({
        success: true,
        callId: call._id.toString(),
        iceServers: ICE_SERVERS,
      });
    } catch (error) {
      console.error("[DEBUG] Call: Error accepting call:", error);
      callback({
        success: false,
        msg: "Failed to accept call",
      });
    }
  });

  // Decline a call
  socket.on("declineCall", async (data: { callId: string }, callback) => {
    try {
      console.log("[DEBUG] Call: Declining call", data.callId);

      const call = await Call.findById(data.callId);
      if (!call) {
        return callback({
          success: false,
          msg: "Call not found",
        });
      }

      // Update call status
      call.status = "declined";
      await call.save();

      // Remove from active calls
      activeCalls.delete(data.callId);

      // Notify caller
      io.to(call.callerId.toString()).emit("callDeclined", {
        callId: call._id.toString(),
        declinedBy: userId,
      });

      callback({
        success: true,
      });
    } catch (error) {
      console.error("[DEBUG] Call: Error declining call:", error);
      callback({
        success: false,
        msg: "Failed to decline call",
      });
    }
  });

  // End a call
  socket.on("endCall", async (data: { callId: string }, callback) => {
    try {
      console.log("[DEBUG] Call: Ending call", data.callId);

      const call = await Call.findById(data.callId);
      if (!call) {
        return callback({
          success: false,
          msg: "Call not found",
        });
      }

      // Calculate duration
      if (call.startTime) {
        call.duration = Math.floor((new Date().getTime() - call.startTime.getTime()) / 1000);
      }
      call.status = "ended";
      call.endTime = new Date();
      await call.save();

      // Remove from active calls
      activeCalls.delete(data.callId);

      // Notify the other party
      const otherUserId = call.callerId.toString() === userId
        ? call.calleeId.toString()
        : call.callerId.toString();
      
      io.to(otherUserId).emit("callEnded", {
        callId: call._id.toString(),
        endedBy: userId,
        duration: call.duration,
      });

      callback({
        success: true,
        duration: call.duration,
      });
    } catch (error) {
      console.error("[DEBUG] Call: Error ending call:", error);
      callback({
        success: false,
        msg: "Failed to end call",
      });
    }
  });

  // WebRTC signaling: Offer
  socket.on("callOffer", async (data: {
    callId: string;
    offer: RTCSessionDescriptionInit;
    targetUserId: string;
  }) => {
    console.log("[DEBUG] Call: Sending offer for call", data.callId);
    
    io.to(data.targetUserId).emit("callOffer", {
      callId: data.callId,
      offer: data.offer,
      from: userId,
    });
  });

  // WebRTC signaling: Answer
  socket.on("callAnswer", async (data: {
    callId: string;
    answer: RTCSessionDescriptionInit;
    targetUserId: string;
  }) => {
    console.log("[DEBUG] Call: Sending answer for call", data.callId);
    
    io.to(data.targetUserId).emit("callAnswer", {
      callId: data.callId,
      answer: data.answer,
      from: userId,
    });
  });

  // WebRTC signaling: ICE Candidate
  socket.on("callIceCandidate", async (data: {
    callId: string;
    candidate: RTCIceCandidateInit;
    targetUserId: string;
  }) => {
    console.log("[DEBUG] Call: Sending ICE candidate for call", data.callId);
    
    io.to(data.targetUserId).emit("callIceCandidate", {
      callId: data.callId,
      candidate: data.candidate,
      from: userId,
    });
  });

  // Toggle media (mute/unmute, camera on/off)
  socket.on("toggleMedia", async (data: {
    callId: string;
    type: "audio" | "video";
    enabled: boolean;
    targetUserId: string;
  }) => {
    console.log("[DEBUG] Call: Toggling media", data.type, "to", data.enabled);
    
    io.to(data.targetUserId).emit("mediaToggled", {
      callId: data.callId,
      type: data.type,
      enabled: data.enabled,
      from: userId,
    });
  });

  // Handle reconnection - rejoin call if in active call
  socket.on("rejoinCall", async (data: { callId: string }, callback) => {
    try {
      const activeCall = activeCalls.get(data.callId);
      if (!activeCall) {
        return callback({
          success: false,
          msg: "Call not found or already ended",
        });
      }

      // Verify user is part of this call
      if (activeCall.callerId !== userId && activeCall.calleeId !== userId) {
        return callback({
          success: false,
          msg: "Not authorized to rejoin this call",
        });
      }

      callback({
        success: true,
        call: activeCall,
        iceServers: ICE_SERVERS,
      });
    } catch (error) {
      console.error("[DEBUG] Call: Error rejoining call:", error);
      callback({
        success: false,
        msg: "Failed to rejoin call",
      });
    }
  });

  // Handle user going offline during a call
  socket.on("disconnect", async () => {
    console.log("[DEBUG] Call: User disconnected", userId);
    
    // Find and end any active calls for this user
    for (const [callId, activeCall] of activeCalls) {
      if (activeCall.callerId === userId || activeCall.calleeId === userId) {
        try {
          const call = await Call.findById(callId);
          if (call && call.status === "connected") {
            call.status = "ended";
            if (call.startTime) {
              call.duration = Math.floor((new Date().getTime() - call.startTime.getTime()) / 1000);
            }
            call.endTime = new Date();
            await call.save();

            // Notify the other party
            const otherUserId = call.callerId.toString() === userId
              ? call.calleeId.toString()
              : call.callerId.toString();
            
            io.to(otherUserId).emit("callEnded", {
              callId: call._id.toString(),
              endedBy: userId,
              duration: call.duration,
            });
          }
          activeCalls.delete(callId);
        } catch (error) {
          console.error("[DEBUG] Call: Error ending call on disconnect:", error);
        }
      }
    }
  });

  console.log("[DEBUG] Call events registered for user:", userId);
};
