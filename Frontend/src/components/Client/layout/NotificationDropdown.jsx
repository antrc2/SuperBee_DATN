"use client";

import {
  X,
  Flame,
  Gift,
  Zap,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Dot,
  Bell, // Thêm icon chuông cho thông báo chung
} from "lucide-react";
import { useEffect, useRef } from "react";
import dayjs from "dayjs"; // Import dayjs
import relativeTime from "dayjs/plugin/relativeTime"; // Import plugin relativeTime
import "dayjs/locale/vi"; // Import locale tiếng Việt
import { Link } from "react-router-dom";
dayjs.extend(relativeTime); // Kích hoạt plugin relativeTime
dayjs.locale("vi"); // Đặt locale mặc định là tiếng Việt

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  isMobile = false,
}) {
  const dropdownRef = useRef(null);

  // Ánh xạ các giá trị số nguyên của 'type' thành chuỗi mô tả
  const getNotificationTypeString = (type) => {
    switch (type) {
      case 1:
        return "system"; // Ví dụ: Thông báo hệ thống, cập nhật chung
      case 2:
        return "promotion"; // Ví dụ: Khuyến mãi, ưu đãi
      case 3:
        return "alert"; // Ví dụ: Cảnh báo, lỗi, khẩn cấp
      default:
        return "info"; // Mặc định là thông tin chung
    }
  };

  // Hàm để lấy icon dựa trên loại thông báo (type là số nguyên)
  const getNotificationIcon = (type, isRead) => {
    const typeString = getNotificationTypeString(type); // Chuyển đổi số nguyên sang chuỗi

    let iconComponent;

    switch (typeString) {
      case "system":
        iconComponent = <Bell className="w-5 h-5 text-purple-400" />;
        break;
      case "promotion":
        iconComponent = <Gift className="w-5 h-5 text-yellow-400" />;
        break;
      case "alert":
        iconComponent = <AlertTriangle className="w-5 h-5 text-red-500" />;
        break;
      case "info":
      default:
        iconComponent = <Info className="w-5 h-5 text-blue-500" />;
        break;
    }

    return <div className="relative">{iconComponent}</div>;
  };

  // Hàm định dạng ngày giờ bằng dayjs
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      // dayjs có thể parse chuỗi ISO trực tiếp
      return dayjs(dateString).fromNow(); // Định dạng "cách đây X"
    } catch (error) {
      console.error("Error formatting date with dayjs:", error);
      return dateString; // Trả về nguyên bản nếu có lỗi
    }
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
          ? "h-full flex flex-col bg-gradient-header "
          : "absolute right-0 top-full z-20 mt-3 w-80 sm:w-96 rounded-2xl  shadow-2xl border bg-gradient-header  "
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 ">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold text-white">🔔 Thông báo</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-300"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      {/* Notifications List */}
      <div
        className={`overflow-y-auto ${
          isMobile ? "flex-grow" : "max-h-80"
        } custom-scrollbar-notification`}
      >
        {notifications.notifications &&
        notifications.notifications.length > 0 ? (
          notifications.notifications.map((notification, index) => {
            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 border-b border-purple-500/10 transition-all duration-300 cursor-pointer group
                ${
                  !notification.is_read // Kiểm tra boolean trực tiếp
                    ? "bg-purple-800/20 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20"
                    : "hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-600/10"
                }`}
              >
                {/* Icon thông báo */}
                <div className="relative flex-shrink-0">
                  {getNotificationIcon(
                    notification.type,
                    !notification.is_read
                  )}
                </div>

                {/* Nội dung thông báo */}
                <Link to={notification.link}>
                  {" "}
                  <div className="flex-grow min-w-0">
                    <p
                      className={`text-sm leading-relaxed transition-colors duration-300
                    ${
                      !notification.is_read // Kiểm tra boolean trực tiếp
                        ? "text-white font-semibold"
                        : "text-white/90 group-hover:text-white"
                    }`}
                    >
                      {notification.content}{" "}
                      {/* Đã đổi từ message sang content */}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-cyan-400 font-medium">
                        {formatDate(notification.published_at)}{" "}
                        {/* Định dạng published_at */}
                      </p>
                      {notification.type === 2 && ( // Kiểm tra type là số nguyên 2 cho 'promotion'
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
                          HOT
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Chấm chưa đọc ở bên phải, nếu thông báo chưa đọc */}
                {!notification.is_read && ( // Kiểm tra boolean trực tiếp
                  <div className="flex-shrink-0 ml-auto">
                    <Dot className="w-8 h-8 text-red-500 fill-current animate-pulse" />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <X className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-sm text-white/60">Không có thông báo mới.</p>
          </div>
        )}
      </div>

      {/* Footer - Nút "Xem tất cả thông báo" được làm nổi bật */}
      <div className="p-4 border-t rounded-b-2xl  border-purple-500/20 bg-purple-900/10 backdrop-blur-sm sticky bottom-0">
        <a
          href="#"
          className="block w-full text-center text-sm font-semibold 
                     bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white py-2.5 rounded-lg 
                     shadow-lg hover:shadow-xl transition-all duration-300 
                     hover:from-purple-700 hover:to-pink-700
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Xem tất cả thông báo
        </a>
      </div>
    </div>
  );
}
