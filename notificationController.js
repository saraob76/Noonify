import Notification from "../models/Notification.js";

// ========================
// GET NOTIFICATIONS
// ========================
export const getNotifications = async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ FIX

    const notifications = await Notification.find({
      receiver: userId,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "full_name profile_picture username");

    res.json({ success: true, notifications });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ========================
// MARK AS READ (SECURE)
// ========================
export const markAsRead = async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ مهم
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.json({
        success: false,
        message: "No notification ids provided",
      });
    }

    await Notification.updateMany(
      {
        _id: { $in: ids },
        receiver: userId, // 🔥 حماية
      },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};