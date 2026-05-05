import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: String,
      required: true,
      index: true,
    },

    sender: {
      type: String,
      ref: "User",
      required: true,
    },

    receiver: {
      type: String,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    message_type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },

    media_url: {
      type: String,
    },

    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: false }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;