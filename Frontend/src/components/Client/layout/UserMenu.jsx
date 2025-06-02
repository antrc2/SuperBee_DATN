import { HistoryIcon, Info, LockIcon, LogOut, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function UserMenu({ user, isOpen, onClose, isMobile = false }) {
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
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
          : "absolute right-0 top-full z-20 mt-2 w-72 rounded-md border bg-white shadow-lg py-1"
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b md:hidden">
        <h3 className="text-md font-semibold text-gray-800">Tài khoản</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close user menu"
        >
          <X size={18} />
        </button>
      </div>
      <div className={`${isMobile ? "flex-grow overflow-y-auto" : ""}`}>
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <img
              src="https://placehold.co/40x40/E2E8F0/4A5568?text=U"
              alt="Avatar"
              className="h-10 w-10 rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/40x40/E2E8F0/4A5568?text=Err";
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "Guest"}
              </p>
              <p className="text-xs text-gray-500">
                Số dư: {user?.money || "0"} VND
              </p>
            </div>
          </div>
        </div>
        {[
          { label: "Thông tin tài khoản", icon: Info, href: "/info" },
          { label: "Đổi mật khẩu", icon: Lock, href: "/info/change-password" },
          {
            label: "Lịch sử giao dịch",
            icon: HistoryIcon,
            href: "/info/transactions"
          }
        ].map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={onClose} // Close dropdown on item click
          >
            <LockIcon size={16} className="text-gray-500" />
            {item.label}
          </Link>
        ))}
        <div className="border-t my-1"></div>
        <button
          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          onClick={logout} // Close dropdown on logout (and trigger actual logout)
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
