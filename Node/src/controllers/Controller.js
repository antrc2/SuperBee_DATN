// src/controllers/NotificationController.js
import { sendEmail } from "./EmailControleer.js";
import { sendNotification } from "./NotificationControler.js";
// import { sendSocketNotification } from "./NotificationControler.js";

const handleIncomingNotification = (io) => async (channel, message) => {
  try {
    const payload = JSON.parse(message);
    const { type, data } = payload;

    console.log(`\n--- Nhận tin nhắn Redis ---`);
    console.log(`  Kênh: ${channel}`);
    console.log(`  Loại Payload: ${type}`);
    console.log(`  Dữ liệu Payload:`, data);

    if (type.startsWith("EMAIL_")) {
      try {
        await sendEmail(type, data);
      } catch (emailError) {
        console.error(
          `[Handler] Lỗi khi chuyển tiếp yêu cầu email loại '${type}':`,
          emailError
        );
      }
    } else if (type.startsWith("NOTIFICATION_")) {
      try {
        sendNotification(io, type, data);
      } catch (emailError) {
        console.error(
          `[Handler] Lỗi khi chuyển tiếp yêu cầu NOTIFICATION_ loại '${type}':`,
          emailError
        );
      }
      // } else if (type.startsWith("message_")) {
      //   // Đây là một tin nhắn (ví dụ: chat message, tin nhắn hệ thống qua chat)
      //   // Ví dụ: 'message_chat', 'message_group_chat', 'message_direct'
      //   console.log(`[Handler] Đang xử lý tin nhắn loại '${type}'...`);
      //   // Có thể dùng chung hàm sendSocketNotification nếu logic tương tự,
      //   // hoặc tạo một hàm riêng cho logic chat phức tạp hơn.
      //   sendSocketNotification(io, type, data); // Gửi tin nhắn qua Socket.IO, 'data' chứa thông tin chat (sender_id, recipient_id, message_text, ...)
    } else {
      console.warn(
        `[Handler] Loại tin nhắn không được xử lý từ Redis: ${type}. Bỏ qua.`
      );
    }
  } catch (e) {
    // Xử lý lỗi nếu có vấn đề trong quá trình phân tích payload hoặc xử lý
    console.error(
      `[Lỗi Xử lý Redis] Có lỗi khi xử lý tin nhắn Redis: ${e.message}`,
      e.stack
    );
  }
};

export default handleIncomingNotification; // Xuất hàm xử lý thông báo để sử dụng trong server.js
