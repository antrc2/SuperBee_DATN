import React from "react";
import dayjs from "dayjs";
// Import cấu hình
import { getNotificationConfig } from "../../../config/notification";

// Giả định dayjs đã được cấu hình ở file main.jsx của dự án
// import relativeTime from "dayjs/plugin/relativeTime";
// import "dayjs/locale/vi";
// dayjs.extend(relativeTime);
// dayjs.locale("vi");

const NotificationItem = ({ notification }) => {
  // `type` ở đây là string, ví dụ: "promotion", "system"
  const { type, content, published_at, is_read } = notification;

  // Lấy toàn bộ thông tin cấu hình cho loại thông báo này
  const config = getNotificationConfig(type);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).fromNow();
  };

  const readClass = is_read
    ? "opacity-70 hover:opacity-100 transition-opacity"
    : "";

  return (
    // Sử dụng các thuộc tính từ đối tượng config
    <div className={`alert ${config.alertClass} ${readClass}`}>
      <div className="flex items-start gap-4">
        <span className="mt-1 flex-shrink-0">{config.icon}</span>
        <div className="flex-grow">
          <p className={!is_read ? "font-semibold" : ""}>{content}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-secondary font-medium">
              {formatDate(published_at)}
            </span>
            {/* Hiển thị badge nếu được định nghĩa trong config */}
            {config.badge && (
              <span className={config.badge.className}>
                {config.badge.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
