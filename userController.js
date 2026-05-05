import imagekit from "../configs/imageKit.js";
import Post from "../models/Post-1.js";
import User from "../models/User.js";
import fs from "fs";
import { inngest } from "../inngest/index.js";
import Connection from "../models/Connection.js";

// ========================
// GET USER DATA
// ========================
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// UPDATE USER
// ========================
export const updatedUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!username) username = tempUser.username;

    if (tempUser.username !== username) {
      const exist = await User.findOne({ username });
      if (exist) username = tempUser.username;
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      updatedData.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      updatedData.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// DISCOVER USERS
// ========================
export const discoverUsers = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { input } = req.body;

    const users = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filtered = users.filter(
      (user) => user._id.toString() !== userId
    );

    res.json({ success: true, users: filtered });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// FOLLOW
// ========================
export const followUser = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.body;

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "Already following",
      });
    }

    user.following.push(id);
    toUser.followers.push(userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// UNFOLLOW
// ========================
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.body;

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    user.following = user.following.filter(
      (u) => u.toString() !== id
    );

    toUser.followers = toUser.followers.filter(
      (u) => u.toString() !== userId
    );

    await user.save();
    await toUser.save();

    res.json({
      success: true,
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// SEND CONNECTION
// ========================
export const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.body;

    const exists = await Connection.findOne({
      from_user_id: userId,
      to_user_id: id,
    });

    if (exists) {
      return res.json({
        success: false,
        message: "Already sent",
      });
    }

    const connection = await Connection.create({
      from_user_id: userId,
      to_user_id: id,
    });

    await inngest.send({
      name: "app/connection-request",
      data: { connectionId: connection._id },
    });

    res.json({
      success: true,
      message: "Request sent",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// GET CONNECTIONS
// ========================
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate(
      "connections followers following"
    );

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const pending = await Connection.find({
      to_user_id: userId,
      status: "pending",
    }).populate("from_user_id");

    res.json({
      success: true,
      connections: user.connections || [],
      followers: user.followers || [],
      following: user.following || [],
      pendingConnections: pending.map((c) => c.from_user_id),
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// ACCEPT CONNECTION
// ========================
export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({
        success: false,
        message: "Not found",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    user.connections.push(id);
    toUser.connections.push(userId);

    await user.save();
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({
      success: true,
      message: "Accepted",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// PROFILE
// ========================
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await User.findById(id);

    if (!profile) {
      return res.json({
        success: false,
        message: "Profile not found",
      });
    }

    const posts = await Post.find({ user: id })
      .populate("user", "full_name profile_picture username")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      profile,
      posts,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// ========================
// 🔒 BLOCK USER
// ========================
export const blockUser = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.body;

    if (userId === id) {
      return res.json({ success: false, message: "You cannot block yourself" });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // إذا بالفعل محظور
    if (user.blockedUsers.includes(id)) {
      return res.json({ success: false, message: "User already blocked" });
    }

    // 🔥 إضافة الحظر
    user.blockedUsers.push(id);
    toUser.blockedBy.push(userId);

    // 🔥 إزالة أي علاقة موجودة (بدون تخريب)
    user.following = user.following.filter(u => u !== id);
    user.followers = user.followers.filter(u => u !== id);
    user.connections = user.connections.filter(u => u !== id);

    toUser.following = toUser.following.filter(u => u !== userId);
    toUser.followers = toUser.followers.filter(u => u !== userId);
    toUser.connections = toUser.connections.filter(u => u !== userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "User blocked successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// ========================
// 🔓 UNBLOCK USER
// ========================
export const unblockUser = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.body;

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    user.blockedUsers = user.blockedUsers.filter(u => u !== id);
    toUser.blockedBy = toUser.blockedBy.filter(u => u !== userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "User unblocked successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// ========================
// 📋 GET BLOCKED USERS
// ========================
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate(
      "blockedUsers",
      "full_name username profile_picture"
    );

    res.json({
      success: true,
      blockedUsers: user.blockedUsers,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};