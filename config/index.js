// config/index.js

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || "23232323232",
  frontend_url: process.env.FRONTEND_URL || "http://localhost:5173",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    // path: process.env.REDIS_PATH || "redis.sock"
  },
  // redis: {
  //   path: process.env.REDIS_PATH || "redis.sock"
  // },
  notificationChannel: "global_notifications_channel",
};

export default config;
