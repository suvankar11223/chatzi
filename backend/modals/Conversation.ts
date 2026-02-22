import mongoose, { Schema } from "mongoose";
import { ConversationProps } from "../types";

const ConversationSchema = new Schema<ConversationProps>(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    name: String,
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    avatar: {
      type: String,
      default: "",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model<ConversationProps>("Conversation", ConversationSchema);

export default Conversation;
