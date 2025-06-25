import connectionManager from "../models/ConnectionManager.js"; // Import ConnectionManager để quản lý các kết nối

// Hàm xử lý thông báo đến từ Redis
// Hàm này nhận đối tượng 'io' của Socket.IO để có thể gửi thông báo tới các client
const handleIncomingNotification = (io) => (channel, message) => {
  try {
    const payload = JSON.parse(message); // Phân tích cú pháp chuỗi JSON nhận được từ Redis
    // Lấy các thông tin cần thiết từ payload: loại thông báo, dữ liệu, và ID người dùng
    const { type, data, user_id } = payload; // Đã bỏ 'web_id' khỏi đây

    console.log(
      `[Thông báo Redis] Loại: ${type}, ID Người dùng: ${
        user_id || "Không có (Công khai)"
      }`
    );
    // Ví dụ log: [Thông báo Redis] Loại: order_status_updated, ID Người dùng: user_123
    // Ví dụ log: [Thông báo Redis] Loại: system_alert, ID Người dùng: Không có (Công khai)
    io.emit("public_notification", { type, data });
    if (user_id) {
      // Nếu payload có user_id, đây là thông báo cá nhân dành cho một người dùng cụ thể
      console.log(
        `[Thông báo Redis] Đang xử lý thông báo cá nhân cho người dùng: ${user_id}`
      );

      // Lấy tất cả Socket IDs của người dùng này từ ConnectionManager
      // (Người dùng có thể có nhiều phiên kết nối trên các thiết bị/tab khác nhau)
      const socketIds = connectionManager.getSocketIdsByUserId(user_id);
      console.log("🚀 ~ socketIds:", socketIds); // Kiểm tra các socket ID tìm thấy

      if (socketIds.length > 0) {
        // Nếu tìm thấy các socket đang hoạt động của người dùng
        socketIds.forEach((socketId) => {
          // Gửi thông báo 'private_notification' tới từng socket của người dùng đó
          // Đây là event name mà client sẽ lắng nghe
          io.to(socketId).emit("private_notification", { type, data });
        });
        console.log(
          `[Thông báo Redis] Đã gửi thông báo riêng tư tới TẤT CẢ các phiên của người dùng ${user_id}.`
        );
      } else {
        // Nếu người dùng đó không online (không có socket nào được tìm thấy)
        console.log(
          `[Thông báo Redis] Người dùng ${user_id} hiện không trực tuyến.`
        );
      }
    } else {
      // Nếu payload không có user_id, đây là thông báo chung cho tất cả các client đang kết nối
      console.log(
        `[Thông báo Redis] Đang xử lý thông báo chung cho TẤT CẢ client.`
      );
      // Gửi thông báo 'public_notification' tới tất cả các client
      io.emit("public_notification", { type, data });
      console.log(
        `[Thông báo Redis] Đã gửi thông báo công khai: Loại "${type}".`
      );
    }
  } catch (error) {
    // Xử lý lỗi nếu có vấn đề trong quá trình phân tích payload hoặc xử lý
    console.error(
      `[Lỗi Xử lý Redis] Có lỗi khi xử lý tin nhắn Redis: ${error.message}`
    );
  }
};

export default handleIncomingNotification; // Xuất hàm xử lý thông báo để sử dụng trong server.js
