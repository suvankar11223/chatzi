import { Socket, Server as SocketIOServer } from "socket.io";

// Debug logging helper
const logDebug = (message: string, ...args: any[]) => {
  console.log(`[Socket:${new Date().toISOString()}]`, message, ...args);
};

export const registerUserEvents = (io: SocketIOServer, socket: Socket): void => {
  // Test socket event
  socket.on("testSocket", (data) => {
    logDebug("testSocket event received:", data);
    socket.emit("testSocket", { msg: "its working!!!" });
  });

  // User online status
  socket.on("userOnline", (data) => {
    const userId = (socket as any).userId;
    console.log(`[DEBUG] Socket: User ${userId} is online`);
    
    // Broadcast to all clients that user is online
    io.emit("userStatusChanged", {
      userId,
      status: "online",
      timestamp: new Date(),
    });
  });

  // User offline status
  socket.on("userOffline", (data) => {
    const userId = (socket as any).userId;
    console.log(`[DEBUG] Socket: User ${userId} is offline`);
    
    // Broadcast to all clients that user is offline
    io.emit("userStatusChanged", {
      userId,
      status: "offline",
      timestamp: new Date(),
    });
  });

  // Join conversation room
  socket.on("joinConversation", (conversationId: string) => {
    console.log(`[DEBUG] Socket: User joining conversation ${conversationId}`);
    socket.join(conversationId);
    socket.emit("conversationJoined", { conversationId });
  });

  // Leave conversation room
  socket.on("leaveConversation", (conversationId: string) => {
    console.log(`[DEBUG] Socket: User leaving conversation ${conversationId}`);
    socket.leave(conversationId);
    socket.emit("conversationLeft", { conversationId });
  });

  // Send message
  socket.on("sendMessage", (data: { conversationId: string; message: any }) => {
    const userId = (socket as any).userId;
    console.log(`[DEBUG] Socket: Message from ${userId} to conversation ${data.conversationId}`);
    
    // Emit to all users in the conversation room except sender
    socket.to(data.conversationId).emit("newMessage", {
      ...data.message,
      senderId: userId,
      timestamp: new Date(),
    });
  });

  // Typing indicator
  socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
    const userId = (socket as any).userId;
    const userEmail = (socket as any).userEmail;
    
    console.log(`[DEBUG] Socket: User ${userEmail} typing in ${data.conversationId}`);
    
    // Emit to all users in the conversation room except sender
    socket.to(data.conversationId).emit("userTyping", {
      userId,
      userEmail,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  });

  // Message read receipt
  socket.on("messageRead", (data: { conversationId: string; messageId: string }) => {
    const userId = (socket as any).userId;
    console.log(`[DEBUG] Socket: Message ${data.messageId} read by ${userId}`);
    
    // Emit to all users in the conversation room
    io.to(data.conversationId).emit("messageReadReceipt", {
      messageId: data.messageId,
      readBy: userId,
      timestamp: new Date(),
    });
  });

  // Update profile event
  socket.on("updateProfile", async (data: { name: string; avatar: string }) => {
    const userId = (socket as any).userId;
    
    if (!userId) {
      return socket.emit("updateProfile", {
        success: false,
        msg: "Unauthorized",
      });
    }

    try {
      const User = (await import('../modals/userModal.js')).default;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name: data.name, avatar: data.avatar },
        { new: true } // will return the updated user
      );

      if (!updatedUser) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "User not found",
        });
      }

      // Emit success to the user
      socket.emit("updateProfile", {
        success: true,
        msg: "Profile updated successfully",
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
        },
      });

      // Broadcast to all connected clients that this user's profile was updated
      io.emit("userProfileUpdated", {
        userId: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      });

      console.log(`[DEBUG] Socket: Profile updated for user ${userId}`);
    } catch (error) {
      console.log("Error updating profile:", error);
      socket.emit("updateProfile", {
        success: false,
        msg: "Error updating profile",
      });
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("[DEBUG] Socket: User event error:", error);
  });

  // Get contacts
  socket.on("getContacts", async () => {
    logDebug('=== GET CONTACTS EVENT ===');
    try {
      const currentUserId = (socket as any).userId;
      logDebug('Current user ID:', currentUserId);
      
      if (!currentUserId) {
        logDebug('ERROR: No userId found on socket');
        socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      const User = (await import('../modals/userModal.js')).default;
      const users = await User.find(
        { _id: { $ne: currentUserId } },
        { password: 0 } // exclude password field
      ).lean(); // will fetch js object

      logDebug(`Found ${users.length} contacts (excluding current user)`);
      if (users.length > 0) {
        logDebug('Contact names:', users.map(u => u.name).join(', '));
      }

      socket.emit("getContacts", {
        success: true,
        data: users,
      });

      logDebug(`Socket: Sent ${users.length} contacts to user ${currentUserId}`);
      logDebug('=== GET CONTACTS COMPLETED ===');
    } catch (error: any) {
      logDebug('=== GET CONTACTS ERROR ===');
      logDebug("getContacts error: ", error.message);
      socket.emit("getContacts", {
        success: false,
        msg: "Failed to fetch contacts",
      });
    }
  });
};
