const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*", // Cho phép mọi domain kết nối, trong thực tế nên giới hạn
    methods: ["GET", "POST"],
  },
});
const Redis = require("ioredis");

// Cấu hình Redis
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  // password: 'your_redis_password' // Nếu có password
});

// Subscribing đến các channel mà Laravel publish
redis.subscribe("chat", function (err, count) {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(`Subscribed to ${count} channel(s).`);
  }
});
redis.on("message", function (channel, message) {
  const eventData = JSON.parse(message);
  console.log(`Received Redis event: ${eventData.event}`);
});

// Lắng nghe tin nhắn từ Redis
redis.on("message", function (channel, message) {
  console.log(
    `Received message from Redis on channel "${channel}": ${message}`
  );
  try {
    const eventData = JSON.parse(message);
    // Kiểm tra và phát sự kiện đến các client Socket.IO
    // eventData.event là tên sự kiện mà Laravel đã định nghĩa trong broadcastAs()
    io.emit(eventData.event, eventData.data);
    console.log(
      `Emitted Socket.IO event "${eventData.event}" with data:`,
      eventData.data
    );
  } catch (e) {
    console.error("Failed to parse message or emit socket event:", e);
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Bạn có thể thêm các sự kiện Socket.IO khác nếu muốn client gửi tin nhắn về server Node.js
  // socket.on('client-message', (data) => {
  //     console.log('Client sent:', data);
  //     // Có thể gửi ngược về Redis hoặc xử lý trực tiếp
  // });
});

// Bắt đầu server Node.js
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Node.js Realtime Server running on port ${PORT}`);
});
