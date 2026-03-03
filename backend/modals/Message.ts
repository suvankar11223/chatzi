import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
    attachment: String,
    type: {
      type: String,
      enum: ['text', 'image', 'voice'],
      default: 'text',
    },
    // Voice message fields
    audioUrl: String,
    audioDuration: Number, // in seconds
    // Pinned message
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: Date,
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Reactions
    reactions: [{
      emoji: String,
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
    }],
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Call message fields
    isCallMessage: {
      type: Boolean,
      default: false,
    },
    callData: {
      type: {
        type: String, // 'voice' or 'video'
        enum: ['voice', 'video'],
      },
      duration: Number, // in seconds
      status: {
        type: String,
        enum: ['completed', 'missed', 'declined'],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
