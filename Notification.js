import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: { type: String, ref: "User", required: true },
    sender: { type: String, ref: "User" },

    type: {
      type: String,
      enum: ["like", "comment", "follow", "message"], // ✅ أضف message
      required: true,
    },

    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },

    text: { type: String },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;