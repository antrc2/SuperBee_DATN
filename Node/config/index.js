// config/index.js
import "dotenv/config"; // Import dotenv and immediately configure it

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || "23232323232",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
  notificationChannel: "global_notifications_channel", // Kênh Redis từ Laravel
};

export default config; // Export the config object as the default export
