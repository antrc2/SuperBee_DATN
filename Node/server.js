// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
import config from "./config/index.js";
import setupSocketEvents from "./src/routers/socketEvents.js";
import handleIncomingNotification from "./src/controllers/Controller.js";
import authMiddleware from "./src/middleware/auth.js";

const app = express();
const server = http.createServer(app);

console.log("[server.js] Đang khởi tạo Socket.IO server...");
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

console.log("[server.js] Đang áp dụng middleware xác thực cho Socket.IO...");
io.use(authMiddleware);

console.log("[server.js] Đang cài đặt các sự kiện cho Socket.IO...");
setupSocketEvents(io);

console.log(
  "[server.js] Đang khởi tạo Redis client để lắng nghe (subscriber)..."
);
const redisSubscriber = new Redis(config.redis);

redisSubscriber.on("connect", () => {
  console.log("[server.js] Redis subscriber đã kết nối thành công.");
  console.log(
    `[server.js] Đang lắng nghe kênh Redis: ${config.notificationChannel}`
  );
  redisSubscriber.subscribe(config.notificationChannel, (err, count) => {
    if (err) {
      console.error(
        `[server.js] Lỗi khi lắng nghe kênh ${config.notificationChannel}: ${err.message}`
      );
    } else {
      console.log(`[server.js] Đã lắng nghe thành công ${count} kênh Redis.`);
    }
  });
});

console.log("[server.js] Đang cài đặt bộ xử lý cho tin nhắn từ Redis...");
redisSubscriber.on("message", handleIncomingNotification(io));

redisSubscriber.on("error", (err) => {
  console.error("[server.js] Lỗi Redis subscriber:", err);
});

app.get("/", (req, res) => {
  res.send("Node.js Notification Server is running!");
});

server.listen(config.port, () => {
  console.log(
    `[server.js] Server Node.js đang lắng nghe tại cổng ${config.port}`
  );
});
