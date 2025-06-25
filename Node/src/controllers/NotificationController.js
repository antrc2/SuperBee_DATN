// src/controllers/NotificationController.js
import connectionManager from "../models/ConnectionManager.js";

function sendSocketNotification(io, notificationEventType, notificationData) {
  const userId = notificationData.user_id;

  if (userId) {
    // Đây là thông báo cá nhân (cho một hoặc nhiều phiên của cùng một người dùng)
    console.log(
      `[Socket Notif] Đang xử lý thông báo riêng tư cho người dùng: ${userId}, Event: ${notificationEventType}`
    );
    const socketIds = connectionManager.getSocketIdsByUserId(userId);

    if (socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        // Gửi thông báo tới từng socket của người dùng đó
        io.to(socketId).emit(notificationEventType, notificationData);
      });
      console.log(
        `[Socket Notif] Đã gửi thông báo riêng tư '${notificationEventType}' tới TẤT CẢ các phiên của người dùng ${userId}.`
      );
    } else {
      console.log(`[Socket Notif] Người dùng ${userId} hiện không trực tuyến.`);
    }
  } else {
    // Đây là thông báo công khai (gửi tới tất cả client đang kết nối)
    console.log(
      `[Socket Notif] Đang xử lý thông báo công khai, Event: ${notificationEventType}`
    );
    io.emit(notificationEventType, notificationData);
    console.log(
      `[Socket Notif] Đã gửi thông báo công khai '${notificationEventType}' tới tất cả client đang kết nối.`
    );
  }
}

/**
 * Hàm xử lý chính cho thông báo đến từ Redis (email, real-time notification, chat message).
 */
const handleIncomingNotification = (io) => async (channel, message) => {
  try {
    const payload = JSON.parse(message);
    const { type, data } = payload;

    console.log(`\n--- Nhận tin nhắn Redis ---`);
    console.log(`  Kênh: ${channel}`);
    console.log(`  Loại Payload: ${type}`);
    console.log(`  Dữ liệu Payload:`, data);

    // Logic để phân loại và xử lý thông báo dựa vào 'type'
    if (type.startsWith("email_")) {
      // Đây là một thông báo email.
      // Ví dụ: 'email_welcome', 'email_order_confirmation', 'email_password_reset'
      console.log(
        `[Handler] Nhận yêu cầu gửi email loại '${type}'. Đang chuyển tiếp đến dịch vụ email...`
      );
      // Vui lòng import và gọi hàm gửi email từ dịch vụ bên ngoài của bạn ở đây.
      // Ví dụ: await emailService.sendEmailByType(type, data);
      // Bạn cần tự tạo và cấu hình 'src/services/emailService.js'
      // và đảm bảo nó export hàm 'sendEmailByType'
      try {
        // Đây là nơi bạn sẽ gọi hàm từ dịch vụ gửi email bên ngoài
        // Ví dụ: await emailService.sendEmailByType(type, data);
        console.log(
          `[Handler] Logic gửi email cho loại '${type}' cần được xử lý bởi một service email riêng biệt.`
        );
        // Thêm code để gọi dịch vụ email của bạn ở đây!
      } catch (emailError) {
        console.error(
          `[Handler] Lỗi khi chuyển tiếp yêu cầu email loại '${type}':`,
          emailError
        );
      }
    } else if (type.startsWith("notification_")) {
      // Đây là một thông báo real-time chung hoặc cá nhân.
      // Ví dụ: 'notification_order_status_updated', 'notification_system_alert', 'notification_new_follower'
      sendSocketNotification(io, type, data); // 'data' ở đây chứa user_id (nếu có) và nội dung thông báo
    } else if (type.startsWith("message_")) {
      // Đây là một tin nhắn (ví dụ: chat message, tin nhắn hệ thống qua chat)
      // Ví dụ: 'message_chat', 'message_group_chat', 'message_direct'
      console.log(`[Handler] Đang xử lý tin nhắn loại '${type}'...`);
      // Có thể dùng chung hàm sendSocketNotification nếu logic tương tự,
      // hoặc tạo một hàm riêng cho logic chat phức tạp hơn.
      sendSocketNotification(io, type, data); // Gửi tin nhắn qua Socket.IO, 'data' chứa thông tin chat (sender_id, recipient_id, message_text, ...)
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
