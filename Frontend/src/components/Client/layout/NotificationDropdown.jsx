import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  isMobile = false
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

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col"
          : "absolute right-0 top-full z-20 mt-2 w-80 sm:w-96 rounded-md border bg-white shadow-lg"
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-md font-semibold text-gray-800">Thông báo</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>
      <div className={`overflow-y-auto ${isMobile ? "flex-grow" : "max-h-80"}`}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <img
                src={notification.avatarUrl}
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/40x40/E2E8F0/4A5568?text=Err";
                }}
              />
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-gray-500 text-center">
            Không có thông báo mới.
          </p>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-2 border-t">
          <a
            href="#"
            className="block w-full text-center text-sm text-blue-600 hover:underline"
          >
            Xem tất cả
          </a>
        </div>
      )}
    </div>
  );
}
