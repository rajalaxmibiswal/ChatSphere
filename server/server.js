import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Body Parser
app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Online Users
export const userSocketMap = {};

// Socket Connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("User Connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit(
    "getOnlineUsers",
    Object.keys(userSocketMap)
  );

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);

    delete userSocketMap[userId];

    io.emit(
      "getOnlineUsers",
      Object.keys(userSocketMap)
    );
  });
});

// Test Route
app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

// API Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "Image size too large. Please upload a smaller image.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});