"use client";

import { X, Dot } from "lucide-react";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
// Import cấu hình
import { getNotificationConfig } from "../../../config/notification";

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  isMobile = false,
}) {
  const dropdownRef = useRef(null);

  // Giả định dayjs đã được cấu hình ở file main.jsx

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).fromNow();
  };

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, isMobile]);

  /**
   * Render nội dung của một thông báo.
   * Tùy vào cấu hình isClickable, nó sẽ được bọc trong thẻ <Link> hoặc <div>.
   */
  const renderNotificationContent = (notification) => {
    // Quan trọng: Giả định notification.type là string ("system", "promotion",...)
    // thay vì số (1, 2, 3) để khớp với file config.
    const config = getNotificationConfig(notification.type);

    // Phần JSX chung cho nội dung
    const contentJSX = (
      <>
        <div className="relative flex-shrink-0 mt-1">{config.icon}</div>
        <div className="flex-grow min-w-0">
          <p
            className={`text-sm leading-relaxed ${
              !notification.is_read
                ? "text-primary font-semibold"
                : "text-secondary group-hover:text-primary"
            }`}
          >
            {notification.content}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-info font-medium">
              {formatDate(notification.published_at)}
            </p>
            {config.badge && (
              <span className={config.badge.className}>
                {config.badge.text}
              </span>
            )}
          </div>
        </div>
        {!notification.is_read && (
          <div className="flex-shrink-0 ml-auto">
            <Dot className="w-8 h-8 text-red-500 fill-current animate-pulse" />
          </div>
        )}
      </>
    );

    // Quyết định render <Link> hay <div> dựa trên cấu hình
    if (config.isClickable && notification.link) {
      return (
        <Link to={notification.link} className="flex items-start gap-4 w-full">
          {contentJSX}
        </Link>
      );
    }

    // Nếu không thể click, render bằng thẻ div
    return <div className="flex items-start gap-4 w-full">{contentJSX}</div>;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col bg-gradient-header"
          : "absolute right-0 top-full z-20 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl border-themed bg-dropdown backdrop-blur-xl"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-themed">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-danger animate-pulse"></div>
          <h3 className="text-lg font-bold text-primary">🔔 Thông báo</h3>
        </div>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary rounded-lg p-1.5 transition-colors"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className={`overflow-y-auto ${
          isMobile ? "flex-grow" : "max-h-80"
        } custom-scrollbar-notification`}
      >
        {notifications.notifications?.length > 0 ? (
          notifications.notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-4 border-b border-themed/50 transition-all duration-300 group ${
                !notification.is_read
                  ? "bg-notification-unread"
                  : "hover:bg-primary/5"
              } ${
                getNotificationConfig(notification.type).isClickable
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
            >
              {/* Gọi hàm render mới */}
              {renderNotificationContent(notification)}
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center">
              <X className="w-8 h-8 text-secondary/40" />
            </div>
            <p className="text-sm text-secondary">Không có thông báo mới.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-themed bg-primary/5 backdrop-blur-sm sticky bottom-0">
        <Link
          to={"/notifications"}
          className="block w-full text-center text-sm font-semibold bg-gradient-button text-accent-contrast py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Xem tất cả thông báo
        </Link>
      </div>
    </div>
  );
}
