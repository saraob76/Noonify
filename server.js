import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import chatRouter from "./routes/chatRoutes.js";

import connectDB from "./configs/db.js";

import messageRouter from "./routes/messageRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 Clerk middleware
app.use(ClerkExpressWithAuth());

// routes
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/ai", chatRouter);

connectDB();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});