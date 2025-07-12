"use client";

import { X, Gift, AlertTriangle, Info, Dot, Bell } from "lucide-react";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  isMobile = false,
}) {
  const dropdownRef = useRef(null);

  const getNotificationTypeString = (type) => {
    switch (type) {
      case 1:
        return "system";
      case 2:
        return "promotion";
      case 3:
        return "alert";
      default:
        return "info";
    }
  };

  const getNotificationIcon = (type) => {
    const typeString = getNotificationTypeString(type);
    switch (typeString) {
      case "system":
        return <Bell className="w-5 h-5 text-highlight" />;
      case "promotion":
        return <Gift className="w-5 h-5 text-accent" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

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
              className={`flex items-start gap-4 p-4 border-b border-themed/50 transition-all duration-300 cursor-pointer group
                ${
                  !notification.is_read
                    ? "bg-notification-unread"
                    : "hover:bg-primary/5"
                }`}
            >
              <div className="relative flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <Link to={notification.link} className="flex-grow min-w-0">
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
                  {notification.type === 2 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-warning text-accent-contrast">
                      HOT
                    </span>
                  )}
                </div>
              </Link>
              {!notification.is_read && (
                <div className="flex-shrink-0 ml-auto">
                  <Dot className="w-8 h-8 text-red-500 fill-current animate-pulse" />
                </div>
              )}
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
        <a
          href="#"
          className="block w-full text-center text-sm font-semibold bg-gradient-button text-accent-contrast py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Xem tất cả thông báo
        </a>
      </div>
    </div>
  );
}
