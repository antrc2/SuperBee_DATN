// src/controllers/Controller.js
import ConnectionManager from "../models/ConnectionManager.js";
import { sendEmail } from "./EmailControleer.js";
import { sendNotification } from "./NotificationControler.js";
import { handleChatMessage } from "./MessageController.js";

const handleIncomingNotification = (io) => async (channel, message) => {
  console.log(
    `\n--- [Controller.js] Nhận được tin nhắn từ kênh Redis '${channel}' ---`
  );
  try {
    const payload = JSON.parse(message);
    const { type, data } = payload;
    console.log(`[Controller.js] Đã phân tích tin nhắn: Type = ${type}`);

    if (type.startsWith("EMAIL_")) {
      console.log(
        `[Controller.js] Nhận diện là một yêu cầu gửi email. Chuyển đến EmailController...`
      );
      await sendEmail(type, data);
    } else if (type.startsWith("NOTIFICATION_")) {
      console.log(
        `[Controller.js] Nhận diện là một yêu cầu gửi thông báo real-time. Chuyển đến NotificationController...`
      );
      sendNotification(io, type, data);
    } else if (type.startsWith("message_")) {
      console.log(
        `[Controller.js] Nhận diện là một tin nhắn chat từ hệ thống. Chuyển đến MessageController...`
      );
      handleChatMessage(io, data);
    } else if (type === "CHAT_ROOM_CREATED") {
      const { roomId, customerId, agentId } = data;
      console.log(
        `[Controller.js] Nhận diện sự kiện tạo phòng chat mới: RoomID=${roomId}, CustomerID=${customerId}, AgentID=${agentId}`
      );
      console.log(
        `[Controller.js] Bắt đầu quá trình "tham gia thầm lặng" (silent join)...`
      );

      const customerSocketIds =
        ConnectionManager.getSocketIdsByUserId(customerId);
      customerSocketIds.forEach((socketId) => {
        const customerSocket = io.sockets.sockets.get(socketId);
        if (customerSocket) {
          customerSocket.join(roomId.toString());
          console.log(
            `[Controller.js]   -> Khách hàng ${customerId} (Socket: ${socketId}) đã được thêm vào phòng ${roomId}`
          );
        }
      });

      if (agentId) {
        const agentSocketIds = ConnectionManager.getSocketIdsByUserId(agentId);
        if (agentSocketIds.length > 0) {
          agentSocketIds.forEach((socketId) => {
            const agentSocket = io.sockets.sockets.get(socketId);
            if (agentSocket) {
              agentSocket.join(roomId.toString());
              console.log(
                `[Controller.js]   -> Nhân viên ${agentId} (Socket: ${socketId}) đã được thêm vào phòng ${roomId}`
              );
            }
          });
        } else {
          console.log(
            `[Controller.js]   -> Nhân viên ${agentId} hiện không online.`
          );
        }
      }
      console.log(`[Controller.js] Quá trình "tham gia thầm lặng" hoàn tất.`);
    } else {
      console.warn(
        `[Controller.js] Không nhận diện được loại sự kiện: ${type}`
      );
    }
  } catch (e) {
    console.error(
      `[Controller.js] Lỗi nghiêm trọng khi xử lý tin nhắn từ Redis: ${e.message}`,
      e.stack
    );
  }
  console.log(`--- [Controller.js] Kết thúc xử lý tin nhắn từ Redis ---\n`);
};

export default handleIncomingNotification;
