import React from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getNotificationConfig } from "../../../config/notification";
import { useHome } from "../../../contexts/HomeContext";

const NotificationItem = ({ notification }) => {
  const { handleMarkAsRead } = useHome();
  const { content, published_at, is_read, type, link } = notification;

  // Lấy toàn bộ thông tin cấu hình cho loại thông báo này
  const config = getNotificationConfig(type);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).fromNow();
  };

  const handleClick = () => {
    // Luôn đánh dấu là đã đọc khi người dùng tương tác
    if (!is_read) {
      handleMarkAsRead(notification);
    }
  };

  return (
    <div
      // Bọc trong thẻ div để xử lý việc đánh dấu đã đọc khi click vào vùng trống
      // Nếu có link, thẻ Link bên trong sẽ xử lý việc điều hướng
      onClick={handleClick}
      className={clsx(
        "alert",
        config.alertClass,
        "transition-all duration-300 ease-in-out ",
        { "opacity-60": is_read },
        { "cursor-pointer hover:opacity-100 hover:shadow-lg": !is_read }
      )}
    >
      <div className="flex items-start gap-4 w-full">
        <span className="mt-1 flex-shrink-0">{config.icon}</span>
        <div className="flex-grow">
          <p className={clsx("text-primary", { "font-semibold": !is_read })}>
            {content}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-2">
            {/* Phần thông tin thời gian và nhãn */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary font-medium">
                {formatDate(published_at)}
              </span>
              {config.badge && (
                <span className={config.badge.className}>
                  {config.badge.text}
                </span>
              )}
            </div>

            {/* Nút "Xem chi tiết" chỉ hiển thị khi có link */}
            {link && (
              <Link
                to={link}
                // Không cần stopPropagation vì hành động mark as read là mong muốn
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Xem chi tiết
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
        {!is_read && (
          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 self-start mt-1.5 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
