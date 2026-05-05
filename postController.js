import fs from "fs";
import imageKit from "../configs/imageKit.js";
import Post from "../models/Post-1.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendNotificationRealtime } from "./messageController.js";

// ========================
// CREATE POST
// ========================
export const addPost = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { content, post_type } = req.body;

    let image_urls = [];

    if (req.files && req.files.length) {
      image_urls = await Promise.all(
        req.files.map(async (file) => {
          const fileBuffer = fs.readFileSync(file.path);

          const response = await imageKit.upload({
            file: fileBuffer,
            fileName: file.originalname,
            folder: "posts",
          });

          return imageKit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });
        })
      );
    }

    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// GET FEED POSTS
// ========================
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const userIds = [
      userId,
      ...(user.connections || []),
      ...(user.following || []),
    ];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user", "full_name profile_picture username")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// LIKE POST
// ========================
export const likePost = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { postId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }

    if (!Array.isArray(post.likes_count)) {
      post.likes_count = [];
    }

    let liked = false;

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes_count.push(userId);
      liked = true;

      if (post.user.toString() !== userId) {
        const notification = await Notification.create({
          receiver: post.user,
          sender: userId,
          type: "like",
          post: post._id,
        });

        sendNotificationRealtime(post.user, notification);
      }
    }

    await post.save();

    res.json({
      success: true,
      message: liked ? "Post liked" : "Post unliked",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// ADD COMMENT
// ========================
export const addComment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { postId, text } = req.body;

    if (!text || text.trim() === "") {
      return res.json({ success: false, message: "Comment is empty" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }

    const newComment = {
      user: userId,
      text,
      replies: [],
    };

    post.comments.push(newComment);
    await post.save();

    if (post.user.toString() !== userId) {
      const notification = await Notification.create({
        receiver: post.user,
        sender: userId,
        type: "comment",
        post: post._id,
        text,
      });

      sendNotificationRealtime(post.user, notification);
    }

    res.json({
      success: true,
      message: "Comment added",
      comment: newComment,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ========================
// DELETE COMMENT
// ========================
export const deleteComment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { postId, commentId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }

    post.comments = post.comments.filter(
      (c) =>
        !(
          c._id.toString() === commentId &&
          c.user.toString() === userId
        )
    );

    await post.save();

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ========================
// REPLY TO COMMENT
// ========================
export const replyToComment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { postId, commentId, text } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.json({ success: false, message: "Comment not found" });
    }

    const reply = {
      user: userId,
      text,
    };

    comment.replies.push(reply);

    await post.save();

    res.json({ success: true, reply });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// ========================
// 🔍 SEARCH POSTS
// ========================
export const searchPosts = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ success: true, posts: [] });
    }

    // 🔥 نجيب كل البوستات مع user
    const posts = await Post.find({})
      .populate("user", "full_name username profile_picture")
      .sort({ createdAt: -1 });

    // 🔥 فلترة (search)
    const filtered = posts.filter((post) => {
      const text = post.content?.toLowerCase() || "";
      const name = post.user?.full_name?.toLowerCase() || "";
      const username = post.user?.username?.toLowerCase() || "";

      return (
        text.includes(q.toLowerCase()) ||
        name.includes(q.toLowerCase()) ||
        username.includes(q.toLowerCase())
      );
    });

    res.json({ success: true, posts: filtered });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};