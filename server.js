// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
import config from "./config/index.js"; // Note the .js extension for local modules
import setupSocketEvents from "./src/routers/socketEvents.js"; // Note the .js extension
import handleIncomingNotification from "./src/controllers/Controller.js"; // Note the .js extension
import authMiddleware from "./src/middleware/auth.js"; // Note the .js extension

// import "./db.js";
const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Địa chỉ ReactJS FE của bạn
    methods: ["GET", "POST"],
  },
});

// Sử dụng middleware nếu cần (ví dụ: xác thực ban đầu)
io.use(authMiddleware);

// Cấu hình Socket.IO events
setupSocketEvents(io);

// Khởi tạo Redis client để subscribe
console.log(config.redis)
const redisSubscriber = new Redis(config.redis);

redisSubscriber.on("connect", () => {
  console.log("Redis subscriber connected.");
  redisSubscriber.subscribe(config.notificationChannel, (err, count) => {
    if (err) {
      console.error(
        `Failed to subscribe to ${config.notificationChannel}: ${err.message}`
      );
    } else {
      console.log(`Subscribed to ${count} Redis channel(s).`);
    }
  });
});

redisSubscriber.on("message", handleIncomingNotification(io)); // Pass io instance to controller

redisSubscriber.on("error", (err) => {
  console.error("Redis subscriber error:", err);
});

// Route cơ bản để kiểm tra server
app.get("/", (req, res) => {
  res.send("Node.js Notification Server is running!");
});

// Bắt đầu lắng nghe
server.listen(config.port, () => {
  console.log(`Node.js server listening on port ${config.port}`);
});
