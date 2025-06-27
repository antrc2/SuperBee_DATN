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

  const menuItems = [
    {
      label: " Thông tin tài khoản",
      icon: Info,
      href: "/info",
      color: "text-blue-400",
    },
    {
      label: " Đổi mật khẩu",
      icon: Lock,
      href: "/info/change-password",
      color: "text-purple-400",
    },
    {
      label: " Lịch sử giao dịch",
      icon: HistoryIcon,
      href: "/info/transactions",
      color: "text-green-400",
    },
    {
      label: "Cài đặt",
      icon: Settings,
      href: "/settings",
      color: "text-orange-400",
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col bg-gradient-to-b from-slate-900 via-purple-900/95 to-slate-900 backdrop-blur-xl"
          : "absolute right-0 top-full z-20 mt-3 w-80 rounded-2xl bg-gradient-to-b from-slate-900 via-purple-900/95 to-slate-900 backdrop-blur-xl shadow-2xl border border-purple-500/20"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-purple-500/20 md:hidden">
        <h3 className="text-lg font-bold text-white"> Tài khoản</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-300"
          aria-label="Close user menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className={`${isMobile ? "flex-grow overflow-y-auto" : ""}`}>
        {/* User Info */}
        <div className="p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://placehold.co/48x48/667eea/ffffff?text=👤"
                alt="Avatar"
                className="h-12 w-12 rounded-full border-2 border-purple-400/50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/48x48/667eea/ffffff?text=👤";
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-white">
                {user?.name || "Gamer Pro"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-semibold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                  {user?.money || "0"} VND
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
              className="flex items-center gap-3 px-4 py-3 text-sm text-white/90 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 transition-all duration-300 group"
              onClick={onClose}
            >
              <item.icon
                size={18}
                className={`${item.color} group-hover:scale-110 transition-transform duration-300`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-purple-500/20 p-2">
          <button
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 group"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <LogOut
              size={18}
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <span className="font-medium"> Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
