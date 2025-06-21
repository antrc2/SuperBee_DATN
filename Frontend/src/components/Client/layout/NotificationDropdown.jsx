"use client";

import { X, Flame, Gift, Zap } from "lucide-react";
import { useEffect, useRef } from "react";

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  isMobile = false,
}) {
  const dropdownRef = useRef(null);

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "promotion":
        return <Gift className="w-5 h-5 text-yellow-400" />;
      case "update":
        return <Zap className="w-5 h-5 text-blue-400" />;
      default:
        return <Flame className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col bg-gradient-to-b from-slate-900 via-purple-900/95 to-slate-900 backdrop-blur-xl"
          : "absolute right-0 top-full z-20 mt-3 w-80 sm:w-96 rounded-2xl bg-gradient-to-b from-slate-900 via-purple-900/95 to-slate-900 backdrop-blur-xl shadow-2xl border border-purple-500/20"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-purple-500/20">
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
      <div className={`overflow-y-auto ${isMobile ? "flex-grow" : "max-h-80"}`}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-4 p-4 border-b border-purple-500/10 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-600/10 transition-all duration-300 cursor-pointer group"
            >
              {/* Avatar with glow effect */}
              <div className="relative flex-shrink-0">
                <img
                  src={notification.avatarUrl || "/placeholder.svg"}
                  alt="Avatar"
                  className="h-12 w-12 rounded-full object-cover border-2 border-purple-400/30 group-hover:border-purple-400/60 transition-colors duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/48x48/667eea/ffffff?text=🎮";
                  }}
                />
                <div className="absolute -top-1 -right-1">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <p className="text-sm text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-cyan-400 font-medium">
                    {notification.timestamp}
                  </p>
                  {notification.type === "promotion" && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
                      HOT
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <X className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-sm text-white/60">Không có thông báo mới.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-purple-500/20">
          <a
            href="#"
            className="block w-full text-center text-sm font-semibold text-cyan-400 hover:text-cyan-300 py-2 rounded-lg hover:bg-cyan-400/10 transition-all duration-300"
          >
            📱 Xem tất cả thông báo
          </a>
        </div>
      )}
    </div>
  );
}
