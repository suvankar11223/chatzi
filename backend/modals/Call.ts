import mongoose, { Document, Schema } from "mongoose";

export interface ICall extends Document {
  callerId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  type: "voice" | "video";
  status: "missed" | "declined" | "completed";
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  agoraChannel: string;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>(
  {
    callerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    type: {
      type: String,
      enum: ["voice", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["missed", "declined", "completed"],
      default: "missed",
    },
    startedAt: Date,
    endedAt: Date,
    duration: {
      type: Number,
      default: 0,
    },
    agoraChannel: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ receiverId: 1, createdAt: -1 });
callSchema.index({ conversationId: 1, createdAt: -1 });

const Call = mongoose.model<ICall>("Call", callSchema);

export default Call;
