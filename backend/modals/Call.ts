import mongoose, { Document, Schema } from "mongoose";

export interface ICall extends Document {
  callerId: mongoose.Types.ObjectId;
  calleeId: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  type: "audio" | "video";
  status: "initiated" | "ringing" | "connected" | "ended" | "missed" | "declined";
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
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
    calleeId: {
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
      enum: ["audio", "video"],
      default: "video",
    },
    status: {
      type: String,
      enum: ["initiated", "ringing", "connected", "ended", "missed", "declined"],
      default: "initiated",
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ calleeId: 1, createdAt: -1 });
callSchema.index({ conversationId: 1, createdAt: -1 });

const Call = mongoose.model<ICall>("Call", callSchema);

export default Call;
