// src/utils/notificationMessageFormatter.js
// Định nghĩa các loại thông báo real-time mà ứng dụng có thể gửi cho người dùng.
// Các hằng số này giúp chuẩn hóa và dễ dàng quản lý các loại thông báo khác nhau.
export const NOTIFICATION_TYPE = {
  // Thông báo liên quan đến tài khoản
  NOTIFICATION_ACCOUNT_ACTIVATED: "NOTIFICATION_ACCOUNT_ACTIVATED", // Thông báo khi tài khoản người dùng được kích hoạt.
  NOTIFICATION_PASSWORD_CHANGED: "NOTIFICATION_PASSWORD_CHANGED", // Thông báo khi mật khẩu tài khoản được thay đổi.
  NOTIFICATION_LOGIN_ATTEMPT: "NOTIFICATION_LOGIN_ATTEMPT", // Cảnh báo về nỗ lực đăng nhập bất thường vào tài khoản.
  NOTIFICATION_PROFILE_UPDATED: "NOTIFICATION_PROFILE_UPDATED", // Thông báo khi thông tin hồ sơ người dùng được cập nhật.

  // Thông báo liên quan đến đơn hàng/giao dịch
  NOTIFICATION_ORDER_CONFIRMED: "NOTIFICATION_ORDER_CONFIRMED", // Xác nhận đơn hàng đã được đặt thành công.
  NOTIFICATION_ORDER_PROCESSING: "NOTIFICATION_ORDER_PROCESSING", // Thông báo đơn hàng đang được xử lý.
  NOTIFICATION_ORDER_COMPLETED: "NOTIFICATION_ORDER_COMPLETED", // Thông báo đơn hàng đã hoàn tất và tài khoản đã được bàn giao.
  NOTIFICATION_ORDER_CANCELLED: "NOTIFICATION_ORDER_CANCELLED", // Thông báo đơn hàng đã bị hủy.
  NOTIFICATION_PAYMENT_RECEIVED: "NOTIFICATION_PAYMENT_RECEIVED", // Xác nhận đã nhận được thanh toán.
  NOTIFICATION_PAYMENT_FAILED: "NOTIFICATION_PAYMENT_FAILED", // Thông báo giao dịch thanh toán thất bại.
  NOTIFICATION_REFUND_PROCESSED: "NOTIFICATION_REFUND_PROCESSED", // Thông báo yêu cầu hoàn tiền đã được xử lý.
  NOTIFICATION_TOPUP_SUCCESS: "NOTIFICATION_TOPUP_SUCCESS", // Xác nhận nạp tiền vào tài khoản thành công.
  NOTIFICATION_TOPUP_FAILED: "NOTIFICATION_TOPUP_FAILED", // Thông báo giao dịch nạp tiền thất bại.

  // Thông báo liên quan đến sản phẩm/game
  NOTIFICATION_NEW_PRODUCT: "NOTIFICATION_NEW_PRODUCT", // Thông báo khi có sản phẩm/tài khoản game mới.
  NOTIFICATION_PRODUCT_RESTOCKED: "NOTIFICATION_PRODUCT_RESTOCKED", // Thông báo khi sản phẩm hết hàng nay có hàng trở lại.
  NOTIFICATION_PRODUCT_DISCOUNT: "NOTIFICATION_PRODUCT_DISCOUNT", // Thông báo về khuyến mãi/giảm giá cho sản phẩm.
  NOTIFICATION_PRICE_CHANGE: "NOTIFICATION_PRICE_CHANGE", // Thông báo khi giá của sản phẩm thay đổi.

  // Thông báo liên quan đến tương tác/hỗ trợ
  NOTIFICATION_NEW_MESSAGE: "NOTIFICATION_NEW_MESSAGE", // Thông báo có tin nhắn mới (ví dụ: từ hỗ trợ khách hàng).
  NOTIFICATION_SUPPORT_REPLY: "NOTIFICATION_SUPPORT_REPLY", // Thông báo đã có phản hồi cho yêu cầu hỗ trợ.
  NOTIFICATION_FEEDBACK_REMINDER: "NOTIFICATION_FEEDBACK_REMINDER", // Nhắc nhở người dùng gửi phản hồi.

  // Thông báo hệ thống/quảng bá
  NOTIFICATION_SYSTEM_MAINTENANCE: "NOTIFICATION_SYSTEM_MAINTENANCE", // Cảnh báo về lịch trình bảo trì hệ thống.
  NOTIFICATION_ANNOUNCEMENT: "NOTIFICATION_ANNOUNCEMENT", // Thông báo chung từ quản trị viên.
  NOTIFICATION_PROMOTIONAL_OFFER: "NOTIFICATION_PROMOTIONAL_OFFER", // Thông báo về các ưu đãi/khuyến mãi quảng bá.
  NOTIFICATION_NEW_FEATURE: "NOTIFICATION_NEW_FEATURE", // Thông báo khi có tính năng mới được triển khai.
};

/**
 * @param {string} io Loại thông báo từ NOTIFICATION_TYPE (hoặc một tin nhắn trực tiếp nếu muốn).
 * @param {string} notificationType Loại thông báo từ NOTIFICATION_TYPE (hoặc một tin nhắn trực tiếp nếu muốn).
 * @param {object} data Dữ liệu bổ sung cho thông báo (ví dụ: { message: "Nội dung", amount: "50,000 VND" }).
 * @returns {{message: string, displayType: 's'|'e'|'i'|'w'|'info'}} Đối tượng chứa tin nhắn và kiểu hiển thị.
 */
export const formatNotificationMessage = (io, notificationType, data = {}) => {
  // Lấy message trực tiếp từ data.message. Nếu không có, dùng notificationType làm message.
  let message = data.message || notificationType;
  let displayType = "info"; // Mặc định là 'info' (thông tin).

  switch (notificationType) {
    case NOTIFICATION_TYPE.NOTIFICATION_TOPUP_SUCCESS:
      displayType = "s"; // 's' = success (thành công)
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_TOPUP_FAILED:
      displayType = "e"; // 'e' = error (lỗi)
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_ORDER_COMPLETED:
      displayType = "s";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_NEW_MESSAGE:
      displayType = "i"; // 'i' = info (thông tin)
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_SYSTEM_MAINTENANCE:
      displayType = "w"; // 'w' = warning (cảnh báo)
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_ACCOUNT_ACTIVATED:
      displayType = "s";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PASSWORD_CHANGED:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_LOGIN_ATTEMPT:
      displayType = "w";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_ORDER_CONFIRMED:
      displayType = "s";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PAYMENT_RECEIVED:
      displayType = "s";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PAYMENT_FAILED:
      displayType = "e";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_REFUND_PROCESSED:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_NEW_PRODUCT:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PRODUCT_RESTOCKED:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PRODUCT_DISCOUNT:
      displayType = "s";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PRICE_CHANGE:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_SUPPORT_REPLY:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_ANNOUNCEMENT:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_PROMOTIONAL_OFFER:
      displayType = "s";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_NEW_FEATURE:
      displayType = "i";
      break;
    case NOTIFICATION_TYPE.NOTIFICATION_FEEDBACK_REMINDER:
      displayType = "i";
      break;
    // Trường hợp mặc định: Nếu notificationType không khớp với bất kỳ loại nào đã định nghĩa.
    // displayType sẽ được lấy từ data.type (nếu có), hoặc giữ nguyên 'info' nếu không có.
    // Điều này cho phép linh hoạt gửi các thông báo tùy chỉnh không theo cấu trúc NOTIFICATION_TYPE.
    default:
      displayType = data.type || "info";
      break;
  }

  return { message, displayType };
};
