// // src/utils/notificationMessageFormatter.js
// // Định nghĩa các loại thông báo real-time mà ứng dụng có thể gửi cho người dùng.
// // Các hằng số này giúp chuẩn hóa và dễ dàng quản lý các loại thông báo khác nhau.
// export const NOTIFICATION_TYPE = {
//   // Thông báo liên quan đến tài khoản
//   NOTIFICATION_ACCOUNT_ACTIVATED: "NOTIFICATION_ACCOUNT_ACTIVATED", // Thông báo khi tài khoản người dùng được kích hoạt.
//   NOTIFICATION_PASSWORD_CHANGED: "NOTIFICATION_PASSWORD_CHANGED", // Thông báo khi mật khẩu tài khoản được thay đổi.
//   NOTIFICATION_LOGIN_ATTEMPT: "NOTIFICATION_LOGIN_ATTEMPT", // Cảnh báo về nỗ lực đăng nhập bất thường vào tài khoản.
//   NOTIFICATION_PROFILE_UPDATED: "NOTIFICATION_PROFILE_UPDATED", // Thông báo khi thông tin hồ sơ người dùng được cập nhật.

//   // Thông báo liên quan đến đơn hàng/giao dịch
//   NOTIFICATION_ORDER_CONFIRMED: "NOTIFICATION_ORDER_CONFIRMED", // Xác nhận đơn hàng đã được đặt thành công.
//   NOTIFICATION_ORDER_PROCESSING: "NOTIFICATION_ORDER_PROCESSING", // Thông báo đơn hàng đang được xử lý.
//   NOTIFICATION_ORDER_COMPLETED: "NOTIFICATION_ORDER_COMPLETED", // Thông báo đơn hàng đã hoàn tất và tài khoản đã được bàn giao.
//   NOTIFICATION_ORDER_CANCELLED: "NOTIFICATION_ORDER_CANCELLED", // Thông báo đơn hàng đã bị hủy.
//   NOTIFICATION_PAYMENT_RECEIVED: "NOTIFICATION_PAYMENT_RECEIVED", // Xác nhận đã nhận được thanh toán.
//   NOTIFICATION_PAYMENT_FAILED: "NOTIFICATION_PAYMENT_FAILED", // Thông báo giao dịch thanh toán thất bại.
//   NOTIFICATION_REFUND_PROCESSED: "NOTIFICATION_REFUND_PROCESSED", // Thông báo yêu cầu hoàn tiền đã được xử lý.
//   NOTIFICATION_TOPUP_SUCCESS: "NOTIFICATION_TOPUP_SUCCESS", // Xác nhận nạp tiền vào tài khoản thành công.
//   NOTIFICATION_TOPUP_FAILED: "NOTIFICATION_TOPUP_FAILED", // Thông báo giao dịch nạp tiền thất bại.

//   // Thông báo liên quan đến sản phẩm/game
//   NOTIFICATION_NEW_PRODUCT: "NOTIFICATION_NEW_PRODUCT", // Thông báo khi có sản phẩm/tài khoản game mới.
//   NOTIFICATION_PRODUCT_RESTOCKED: "NOTIFICATION_PRODUCT_RESTOCKED", // Thông báo khi sản phẩm hết hàng nay có hàng trở lại.
//   NOTIFICATION_PRODUCT_DISCOUNT: "NOTIFICATION_PRODUCT_DISCOUNT", // Thông báo về khuyến mãi/giảm giá cho sản phẩm.
//   NOTIFICATION_PRICE_CHANGE: "NOTIFICATION_PRICE_CHANGE", // Thông báo khi giá của sản phẩm thay đổi.

//   // Thông báo liên quan đến tương tác/hỗ trợ
//   NOTIFICATION_NEW_MESSAGE: "NOTIFICATION_NEW_MESSAGE", // Thông báo có tin nhắn mới (ví dụ: từ hỗ trợ khách hàng).
//   NOTIFICATION_SUPPORT_REPLY: "NOTIFICATION_SUPPORT_REPLY", // Thông báo đã có phản hồi cho yêu cầu hỗ trợ.
//   NOTIFICATION_FEEDBACK_REMINDER: "NOTIFICATION_FEEDBACK_REMINDER", // Nhắc nhở người dùng gửi phản hồi.

//   // Thông báo hệ thống/quảng bá
//   NOTIFICATION_SYSTEM_MAINTENANCE: "NOTIFICATION_SYSTEM_MAINTENANCE", // Cảnh báo về lịch trình bảo trì hệ thống.
//   NOTIFICATION_ANNOUNCEMENT: "NOTIFICATION_ANNOUNCEMENT", // Thông báo chung từ quản trị viên.
//   NOTIFICATION_PROMOTIONAL_OFFER: "NOTIFICATION_PROMOTIONAL_OFFER", // Thông báo về các ưu đãi/khuyến mãi quảng bá.
//   NOTIFICATION_NEW_FEATURE: "NOTIFICATION_NEW_FEATURE", // Thông báo khi có tính năng mới được triển khai.
// };
import ConnectionManager from "../models/ConnectionManager.js";
export const SEND_NOTIFICATION_TYPE = {
  PERSONAL: "NOTIFICATION_PRIVATE", // Thông báo cá nhân
  GLOBAL: "NOTIFICATION_PUBLIC", // Thông báo chung
};

/**
 * Gửi thông báo đến người dùng (hoặc tất cả người dùng online trong phòng chung).
 *
 * @param {'personal'|'global'} type Loại thông báo: 'personal' cho cá nhân, 'global' cho tất cả.
 * @param {object} data Dữ liệu bổ sung cho thông báo (ví dụ: { message: "Đơn hàng #123 đã hoàn thành", orderId: "123" }).
 */
export const sendNotification = (io, type, data = []) => {
  if (type === SEND_NOTIFICATION_TYPE.PERSONAL) {
    const userId = data?.user_id;
    if (!userId) {
      console.error(
        "[NotificationSender] Lỗi: Cần có userId cho thông báo cá nhân."
      );
      return;
    }
    const socketIds = ConnectionManager.getSocketIdsByUserId(userId);
    if (socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        io.to(socketId).emit("private_notifications", { data }); // Gửi tới từng socket của người dùng
        console.log(
          `[NotificationSender] Gửi cá nhân tới User ${userId}, Socket ${socketId}`
        );
      });
    } else {
      console.log(
        `[NotificationSender] Người dùng ${userId} không online hoặc chưa kết nối socket.`
      );
    }
  } else if (type === SEND_NOTIFICATION_TYPE.GLOBAL) {
    io.to("public_notifications").emit("public_notifications", { data });
    console.log(`[NotificationSender] Gửi thông báo chung tới phòng`);
  } else {
    console.error(
      `[NotificationSender] Lỗi: Loại thông báo không hợp lệ: ${type}`
    );
  }
};
