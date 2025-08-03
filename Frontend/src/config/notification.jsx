import React from "react";
import { Bell, Gift, AlertTriangle, Info, Wrench } from "lucide-react";

/**
 * Đối tượng cấu hình trung tâm cho tất cả các loại thông báo.
 * - key: Một định danh duy nhất (string) cho loại thông báo, sẽ được trả về từ API.
 * - id: Định danh.
 * - label: Tên hiển thị trong bộ lọc trên trang thông báo.
 * - icon: Component icon sẽ được hiển thị.
 * - alertClass: Class CSS (ví dụ từ DaisyUI/Tailwind) để tạo kiểu cho nền của item.
 * - showInFilter: Có hiển thị loại này trong bộ lọc hay không.
 * - badge: (Tùy chọn) Một nhãn nhỏ để làm nổi bật thông báo.
 */
export const NOTIFICATION_TYPES = {
  1: {
    id: "promotion",
    label: "Khuyến mãi",
    icon: <Gift size={20} className="text-yellow-500" />,
    alertClass: "alert-warning",
    showInFilter: true,
    badge: {
      text: "HOT",
      className:
        "px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white",
    },
  },
  2: {
    id: "system",
    label: "Hệ thống",
    icon: <Bell size={20} className="text-blue-500" />,
    alertClass: "alert-info",
    showInFilter: true,
  },
  alert: {
    id: "alert",
    label: "Cảnh báo",
    icon: <AlertTriangle size={20} className="text-red-600" />,
    alertClass: "alert-danger",
    showInFilter: true,
  },
  info: {
    id: "info",
    label: "Thông tin",
    icon: <Info size={20} className="text-green-500" />,
    alertClass: "alert-success",
    showInFilter: true,
  },
  // Loại mặc định, sử dụng khi API trả về một type không xác định
  default: {
    id: "default",
    label: "Chung",
    icon: <Bell size={20} />,
    alertClass: "alert-secondary",
    showInFilter: false,
  },
};

/**
 * Hàm tiện ích để lấy cấu hình một cách an toàn.
 * Nếu không tìm thấy `type`, sẽ trả về cấu hình mặc định.
 * @param {string} type - Định danh của loại thông báo (ví dụ: "system", "promotion").
 * @returns {object} - Đối tượng cấu hình cho loại thông báo đó.
 */
export const getNotificationConfig = (type) => {
  return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.default;
};
