import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import NotificationItem from "../Notification/NotificationItem";
import { useHome } from "../../../contexts/HomeContext";

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications } = useHome();
  const dropdownRef = useRef(null);
  const navigator = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const handelViewAll = () => {
    navigator("/notifications");
    onClose();
  };
  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-20 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl border-themed bg-dropdown backdrop-blur-xl"
    >
      <div className="flex justify-between items-center p-4 border-b border-themed">
        <h3 className="text-lg font-bold text-primary">🔔 Thông báo</h3>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary rounded-lg p-1.5 transition-colors"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto max-h-80 custom-scrollbar-notification">
        {notifications?.notifications?.length > 0 ? (
          <div className="space-y-1 p-1">
            {notifications.notifications.map((notification) => (
              // Sử dụng NotificationItem ở đây
              <NotificationItem
                key={`${notification.notification_scope}-${notification.id}`}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-secondary">Không có thông báo mới.</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-themed">
        <span
          onClick={handelViewAll}
          className="block w-full text-center cursor-pointer text-sm font-semibold bg-gradient-button text-accent-contrast py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Xem tất cả
        </span>
      </div>
    </div>
  );
}
