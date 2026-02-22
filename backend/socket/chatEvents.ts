import { Server as SocketIOServer, Socket } from "socket.io";
import Conversation from "../modals/Conversation";
import Message from "../modals/Message";

// Debug logging helper
const logDebug = (message: string, ...args: any[]) => {
  console.log(`[ChatEvents:${new Date().toISOString()}]`, message, ...args);
};

export function registerChatEvents(io: SocketIOServer, socket: Socket) {
  socket.on("getConversations", async () => {
    logDebug('=== getConversations EVENT ===');
    try {
      const userId = (socket as any).userId;
      logDebug('User ID:', userId);
      
      if (!userId) {
        logDebug('ERROR: No userId found on socket');
        socket.emit("getConversations", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      const conversations = await Conversation.find({
        participants: userId
      })
      .sort({ updatedAt: -1 })
      .populate({
        path: "lastMessage",
        select: "content senderId attachment createdAt"
      })
      .populate({
        path: "participants",
        select: "name avatar email",
      })
      .lean();

      logDebug(`Found ${conversations.length} conversations`);

      // Add unread count for each conversation
      const conversationsWithUnread = conversations.map((conv: any) => ({
        ...conv,
        unreadCount: conv.unreadCount?.get(userId.toString()) || 0,
      }));

      socket.emit("getConversations", {
        success: true,
        data: conversationsWithUnread,
      });

      logDebug(`Socket: Sent ${conversations.length} conversations to user ${userId}`);
      logDebug('=== getConversations COMPLETED ===');
    } catch (error: any) {
      logDebug('getConversations ERROR:', error.message);
      socket.emit("getConversations", {
        success: false,
        msg: "Failed to fetch conversations",
      });
    }
  });

  socket.on("newConversation", async (data) => {
    console.log("=== NEW CONVERSATION EVENT RECEIVED ===");
    console.log("Socket ID:", socket.id);
    console.log("User ID:", (socket as any).userId);
    console.log("Data:", JSON.stringify(data, null, 2));

    try {
      const userId = (socket as any).userId;

      if (!userId) {
        console.log("ERROR: No userId found on socket");
        socket.emit("newConversation", {
          success: false,
          msg: "Unauthorized - no user ID",
        });
        return;
      }

      if (data.type === 'direct') {
        console.log("Checking for existing direct conversation...");
        // check if already exists
        const existingConversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        });

        if (existingConversation) {
          console.log("Direct conversation already exists:", existingConversation._id);
          
          // Populate the existing conversation
          const populated = await Conversation.findById(existingConversation._id)
            .populate({
              path: "participants",
              select: "name avatar email"
            }).lean();
          
          socket.emit("newConversation", {
            success: true,
            data: populated,
            msg: "Conversation already exists",
          });
          return;
        }
        
        console.log("No existing conversation found, creating new one...");
      }

      // Create new conversation
      console.log("Creating new conversation with data:", {
        type: data.type,
        name: data.name || null,
        participants: data.participants,
        createdBy: userId,
        avatar: data.avatar || "",
      });
      
      const newConversation = await Conversation.create({
        type: data.type,
        name: data.name || null,
        participants: data.participants,
        createdBy: userId,
        avatar: data.avatar || "",
      });

      console.log("New conversation created successfully:", newConversation._id);

      // Get all connected sockets that are participants
      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes((s as any).userId)
      );

      console.log("Found", connectedSockets.length, "connected participants");

      // Join this conversation by all online participants
      connectedSockets.forEach((participantSocket) => {
        participantSocket.join(newConversation._id.toString());
        console.log("Socket", participantSocket.id, "joined room", newConversation._id.toString());
      });

      // Send conversation data back (populated)
      const populatedConversation = await Conversation.findById(newConversation._id)
        .populate({
          path: "participants",
          select: "name avatar email"
        }).lean();

      if (!populatedConversation) {
        throw new Error("Failed to populate conversation");
      }

      console.log("Emitting newConversation to room:", newConversation._id.toString());
      console.log("Populated conversation:", JSON.stringify(populatedConversation, null, 2));

      // Emit conversation to all participants individually
      const allSockets = Array.from(io.sockets.sockets.values());
      data.participants.forEach((participantId: string) => {
        const participantSockets = allSockets.filter(
          (s) => (s as any).userId === participantId
        );
        
        participantSockets.forEach((participantSocket) => {
          participantSocket.emit("newConversation", {
            success: true,
            data: { ...populatedConversation, isNew: true },
          });
          console.log(`Emitted newConversation to participant ${participantId}, socket: ${participantSocket.id}`);
        });
      });
      
      console.log("=== NEW CONVERSATION EVENT COMPLETED ===");

    } catch (error: any) {
      console.log("=== NEW CONVERSATION ERROR ===");
      console.log("Error:", error);
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
      
      socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation: " + error.message,
      });
    }
  });

  socket.on("newMessage", async (data) => {
    console.log('=== NEW MESSAGE EVENT ===');
    console.log('From:', (socket as any).userEmail);
    console.log('Content:', data.content);
    console.log('Has attachment:', !!data.attachment);
    
    try {
      // Validate data - require either content OR attachment
      if (!data.conversationId || !data.sender?.id) {
        throw new Error('Missing conversation ID or sender');
      }
      
      if (!data.content && !data.attachment) {
        throw new Error('Message must have either content or attachment');
      }

      // Create message in database
      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: data.sender.id,
        content: data.content || '',
        attachment: data.attachment || null,
        readBy: [data.sender.id], // Sender has read their own message
      });

      console.log('✓ Message saved:', message._id);

      const messageData = {
        success: true,
        data: {
          id: message._id.toString(),
          content: data.content || '',
          sender: {
            id: data.sender.id,
            name: data.sender.name,
            avatar: data.sender.avatar,
          },
          attachment: data.attachment || null,
          createdAt: message.createdAt.toISOString(),
          conversationId: data.conversationId,
        },
      };

      // EMIT IMMEDIATELY to conversation room (fastest delivery)
      io.to(data.conversationId).emit("newMessage", messageData);
      console.log('✓ Emitted to room:', data.conversationId);

      // Update conversation's lastMessage and increment unread counts in background
      Conversation.findById(data.conversationId).then(async (conversation) => {
        if (!conversation) return;

        // Increment unread count for all participants except sender
        const unreadCount = conversation.unreadCount || new Map();
        conversation.participants.forEach((participantId: any) => {
          const participantIdStr = participantId.toString();
          if (participantIdStr !== data.sender.id) {
            const currentCount = unreadCount.get(participantIdStr) || 0;
            unreadCount.set(participantIdStr, currentCount + 1);
          }
        });

        conversation.lastMessage = message._id as any;
        conversation.unreadCount = unreadCount;
        conversation.updatedAt = new Date();
        await conversation.save();

        console.log('✓ Updated conversation with unread counts');
      }).catch(err => console.error('Error updating conversation:', err));

      console.log('=== MESSAGE SENT ===');

    } catch (error: any) {
      console.log('=== ERROR ===');
      console.log(error.message);
      socket.emit("newMessage", {
        success: false,
        msg: "Failed to send message: " + error.message,
      });
    }
  });

  socket.on("getMessages", async (data: { conversationId: string }) => {
    console.log("=== GET MESSAGES EVENT ===");
    console.log("User:", (socket as any).userEmail);
    console.log("Socket ID:", socket.id);
    console.log("Conversation ID:", data.conversationId);
    
    try {
      const messages = await Message.find({
        conversationId: data.conversationId,
      })
        .sort({ createdAt: -1 }) // newest first
        .populate({
          path: "senderId",
          select: "name avatar",
        });

      console.log("Found", messages.length, "messages");

      const messagesWithSender = messages.map((message: any) => ({
        id: message._id,
        content: message.content,
        attachment: message.attachment,
        createdAt: message.createdAt,
        sender: {
          id: message.senderId._id,
          name: message.senderId.name,
          avatar: message.senderId.avatar,
        },
      }));

      socket.emit("getMessages", {
        success: true,
        data: messagesWithSender,
      });

      console.log("=== GET MESSAGES COMPLETED ===");

    } catch (error) {
      console.log("=== GET MESSAGES ERROR ===");
      console.log("getMessages error: ", error);
      socket.emit("getMessages", {
        success: false,
        msg: "Failed to fetch messages",
      });
    }
  });

  socket.on("joinConversation", (conversationId: string) => {
    console.log("=== JOIN CONVERSATION EVENT ===");
    console.log("User:", (socket as any).userEmail);
    console.log("Socket ID:", socket.id);
    console.log("Conversation ID:", conversationId);
    
    socket.join(conversationId);
    
    // Get all sockets in this room
    const socketsInRoom = io.sockets.adapter.rooms.get(conversationId);
    console.log("Sockets in room:", socketsInRoom ? socketsInRoom.size : 0);
    
    socket.emit("conversationJoined", { conversationId });
    console.log("=== JOIN CONVERSATION COMPLETED ===");
  });

  socket.on("markAsRead", async (data: { conversationId: string }) => {
    console.log("=== MARK AS READ EVENT ===");
    console.log("User:", (socket as any).userEmail);
    console.log("Conversation ID:", data.conversationId);
    
    try {
      const userId = (socket as any).userId;
      if (!userId) {
        socket.emit("markAsRead", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      // Reset unread count for this user in this conversation
      const conversation = await Conversation.findById(data.conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const unreadCount = conversation.unreadCount || new Map();
      unreadCount.set(userId.toString(), 0);
      conversation.unreadCount = unreadCount;
      await conversation.save();

      // Mark all messages in this conversation as read by this user
      await Message.updateMany(
        {
          conversationId: data.conversationId,
          senderId: { $ne: userId },
          readBy: { $ne: userId },
        },
        {
          $addToSet: { readBy: userId },
        }
      );

      socket.emit("markAsRead", {
        success: true,
        data: { conversationId: data.conversationId },
      });

      console.log("✓ Marked conversation as read for user");
      console.log("=== MARK AS READ COMPLETED ===");

    } catch (error: any) {
      console.log("=== MARK AS READ ERROR ===");
      console.log(error.message);
      socket.emit("markAsRead", {
        success: false,
        msg: "Failed to mark as read: " + error.message,
      });
    }
  });
}
