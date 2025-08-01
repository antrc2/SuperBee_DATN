// config/index.js

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "Sqrtfl0@t01bfkskvqfayl0",
  frontend_url: process.env.FRONTEND_URL || "https://superbee.site",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 1234,
    // path: process.env.REDIS_PATH || "redis.sock"
  },
  // redis: {
  //   socket: {
  //     path: process.env.REDIS_PATH || "/home/mptvweo/.application/redis.sock"
  //   }
    // path: process.env.REDIS_PATH || "/home/mptvweo/.application/redis.sock"
  // },
  notificationChannel: "global_notifications_channel",
};

export default config;
