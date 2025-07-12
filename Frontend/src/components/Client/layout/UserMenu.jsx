"use client";

import {
  HistoryIcon,
  Info,
  Lock,
  LogOut,
  X,
  Wallet,
  Settings,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import Image from "../Image/Image";
import { formatCurrencyVND } from "../../../utils/hook";

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

  // Sử dụng các lớp màu ngữ nghĩa
  const menuItems = [
    {
      label: " Thông tin tài khoản",
      icon: Info,
      href: "/info",
      color: "text-info", // Thay vì text-blue-400
    },
    {
      label: " Đổi mật khẩu",
      icon: Lock,
      href: "/info/change-password",
      color: "text-accent", // Thay vì text-purple-400
    },
    {
      label: " Lịch sử giao dịch",
      icon: HistoryIcon,
      href: "/info/transactions",
      color: "text-tertiary", // Thay vì text-green-400
    },
    {
      label: "Cài đặt",
      icon: Settings,
      href: "/settings",
      color: "text-highlight", // Thay vì text-orange-400
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col bg-gradient-header backdrop-blur-xl"
          : "absolute right-0 top-full z-20 mt-3 w-80 rounded-2xl bg-dropdown backdrop-blur-xl shadow-2xl border-themed"
      }`}
    >
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 border-b border-themed md:hidden">
        <h3 className="text-lg font-bold text-primary"> Tài khoản</h3>
        <button
          onClick={onClose}
          className="text-secondary hover:text-primary hover:bg-primary/10 rounded-lg p-1.5 transition-colors"
          aria-label="Close user menu"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className={`${
          isMobile
            ? "flex-grow overflow-y-auto custom-scrollbar-notification"
            : ""
        }`}
      >
        {/* User Info */}
        <div className="p-4 border-b border-themed">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                url={user?.avatar}
                alt="Avatar"
                className="h-12 w-12 rounded-full border-2 border-highlight/50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/48x48/667eea/ffffff?text=👤";
                }}
              />
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-tertiary rounded-full border-2"
                style={{ borderColor: "var(--color-background)" }}
              ></div>
            </div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-primary">
                {user?.name || "Gamer Pro"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Wallet className="w-4 h-4 text-highlight" />
                <p className="text-sm font-semibold text-transparent text-primary">
                  {formatCurrencyVND(user?.money) || "0"} VND
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-primary/5 transition-colors group"
              onClick={onClose}
            >
              <item.icon
                size={18}
                className={`${item.color} group-hover:scale-110 transition-transform`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-themed p-2">
          <button
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <LogOut
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-medium"> Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
