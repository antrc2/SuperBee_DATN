import ConnectionManager from "../models/ConnectionManager.js";

/**
 * Xử lý một tin nhắn chat nhận được từ Redis và phát nó tới các client trong phòng chat tương ứng.
 * @param {object} io - Instance của Socket.IO server.
 * @param {object} data - Dữ liệu tin nhắn từ Redis.
 * Expected data format from Redis:
 * {
 * roomId: string | number,
 * messageObject: {
 * id: number,
 * chat_room_id: number,
 * sender_id: number,
 * content: string,
 * created_at: string, // ISO 8601 format
 * sender_name: string,
 * sender_avatar: string
 * }
 * }
 */
const handleChatMessage = (io, data) => {
  const { roomId, messageObject } = data;

  if (!roomId || !messageObject) {
    console.error(
      "[MessageController] Dữ liệu tin nhắn từ Redis không hợp lệ. Thiếu 'roomId' hoặc 'messageObject'.",
      data
    );
    return;
  }

  // Sử dụng event name 'new_chat_message' để nhất quán với luồng gửi tin nhắn trực tiếp từ client.
  // Nhờ đó, frontend không cần phải lắng nghe thêm một sự kiện mới.
  io.to(roomId.toString()).emit("new_chat_message", messageObject);

  console.log(
    `[MessageController] Đã phát tin nhắn (ID: ${messageObject.id}) tới phòng ${roomId}`
  );
};

export { handleChatMessage };
