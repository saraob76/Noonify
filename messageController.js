import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Message from "../models/message.js";
import Notification from "../models/Notification.js";

const connections = {};

// ========================
// 🔔 SEND NOTIFICATION REALTIME
// ========================
export const sendNotificationRealtime = (userId, notification) => {
  const conn = connections[userId.toString()];
  if (conn) {
    conn.write(
      `data: ${JSON.stringify({
        type: "notification",
        data: notification,
      })}\n\n`
    );
  }
};

// ========================
// SSE CONNECTION (FIXED)
// ========================
export const sseController = (req, res) => {
  const userId = req.auth.userId; // 🔥 مهم

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  connections[userId.toString()] = res;

  // أول اتصال
  res.write(
    `data: ${JSON.stringify({ type: "connected" })}\n\n`
  );

  req.on("close", () => {
    delete connections[userId.toString()];
  });
};

// ========================
// HELPER
// ========================
const getConversationId = (user1, user2) => {
  return user1 < user2
    ? `${user1}_${user2}`
    : `${user2}_${user1}`;
};

// ========================
// SEND MESSAGE
// ========================
export const sendMessage = async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ FIX
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (image) {
      const fileBuffer = fs.readFileSync(image.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const conversation_id = getConversationId(
      userId.toString(),
      to_user_id.toString()
    );

    const message = await Message.create({
      conversation_id,
      sender: userId.toString(),
      receiver: to_user_id.toString(),
      text,
      message_type,
      media_url,
    });

    // 🔔 Notification
    const notification = await Notification.create({
      receiver: to_user_id,
      sender: userId,
      type: "message",
      text: text || "Sent you an image",
    });

    sendNotificationRealtime(to_user_id, notification);

    // 🔥 realtime
    if (connections[to_user_id.toString()]) {
      connections[to_user_id.toString()].write(
        `data: ${JSON.stringify(message)}\n\n`
      );
    }

    if (connections[userId.toString()]) {
      connections[userId.toString()].write(
        `data: ${JSON.stringify(message)}\n\n`
      );
    }

    res.json({ success: true, message });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// GET CHAT
// ========================
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ FIX
    const { to_user_id } = req.body;

    const conversation_id = getConversationId(
      userId.toString(),
      to_user_id.toString()
    );

    const messages = await Message.find({ conversation_id }).sort({
      createdAt: 1,
    });

    await Message.updateMany(
      {
        receiver: userId.toString(),
        sender: to_user_id.toString(),
        seen: false,
      },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// RECENT CHATS
// ========================
export const getUserRecentMessages = async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ FIX

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId.toString() },
            { receiver: userId.toString() },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversation_id",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};