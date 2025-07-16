import { Bell, Gift, AlertTriangle, Info, Wrench } from "lucide-react";

export const NOTIFICATION_TYPES = {
  // Mỗi key là một định danh duy nhất cho loại thông báo (nên dùng string)
  promotion: {
    id: "promotion",
    label: "Khuyến mãi", // Tên hiển thị trong bộ lọc
    icon: <Gift size={20} className="text-highlight" />,
    alertClass: "alert-warning", // Class CSS cho trang chi tiết
    isClickable: true, // Có thể click để xem chi tiết hay không
    showInFilter: true, // Có hiển thị trong bộ lọc không
    badge: {
      text: "HOT",
      className:
        "px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-warning text-accent-contrast",
    },
  },
  system: {
    id: "system",
    label: "Hệ thống",
    icon: <Bell size={20} className="text-info" />,
    alertClass: "alert-info",
    isClickable: true,
    showInFilter: true,
  },
  alert: {
    id: "alert",
    label: "Cảnh báo",
    icon: <AlertTriangle size={20} className="text-red-500" />,
    alertClass: "alert-danger",
    isClickable: true,
    showInFilter: true,
  },
  info: {
    id: "info",
    label: "Thông tin",
    icon: <Info size={20} />,
    alertClass: "alert-success",
    isClickable: false, // Loại này không thể click xem chi tiết
    showInFilter: true,
  },
  // Ví dụ thêm một loại mới dễ dàng
  // maintenance: {
  //   id: "maintenance",
  //   label: "Bảo trì",
  //   icon: <Wrench size={20} />,
  //   alertClass: "alert-info",
  //   isClickable: false,
  //   showInFilter: false, // Ẩn khỏi bộ lọc
  // }
};

/**
 * Hàm tiện ích để lấy cấu hình một cách an toàn.
 * Nếu không tìm thấy loại `type`, sẽ trả về cấu hình của 'info' làm mặc định.
 * @param {string} type - Định danh của loại thông báo (ví dụ: "system", "promotion")
 * @returns {object} - Đối tượng cấu hình cho loại thông báo đó.
 */
export const getNotificationConfig = (type) => {
  return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
};
