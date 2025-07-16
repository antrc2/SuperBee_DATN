"use client";

import { NavLink } from "react-router-dom";
import { User, Lock, Wallet, Package, LogOut, Coins, Copy, X } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { useNotification } from "@contexts/NotificationContext";

import { useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [showAffiliate, setShowAffiliate] = useState(false);
  const URL_FE = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
  const affiliateLink = `${URL_FE}/auth/register?aff=${user?.id || ""}`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };
  const { pop } = useNotification();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      pop("Đã copy link liên kết thành công!", "s"); // "s" là success
    } catch {
      pop("Copy thất bại, hãy thử lại!", "e"); // "e" là error
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-semibold ${
      isActive
        ? "bg-accent/10 text-accent"
        : "text-secondary hover:bg-accent/5 hover:text-primary"
    }`;

  return (
    <aside className="w-full md:w-72 flex-shrink-0 section-bg rounded-2xl shadow-lg flex flex-col p-4 h-fit">
      {/* User Info */}
      <div className="text-center p-4 border-b border-themed">
        <div className="relative inline-block mb-3">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/50"
          />
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-content-bg"></div>
        </div>
        <h3 className="font-heading text-xl font-bold text-primary">
          {user?.name || "username"}
        </h3>
        <div className="mt-4 bg-background rounded-lg p-3 border border-themed">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-secondary">Số dư</span>
          </div>
          <p className="font-bold text-lg text-center text-accent">
            {formatCurrency(user?.money)}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 mt-2 space-y-4">
        <div>
          <h4 className="px-4 mb-2 text-xs font-bold uppercase text-secondary tracking-wider">
            Tài Khoản
          </h4>
          <div className="space-y-1">
            <NavLink to="/info" end className={navLinkClass}>
              <User className="h-5 w-5" />
              <span>Thông tin</span>
            </NavLink>
            <NavLink to="/info/change-password" className={navLinkClass}>
              <Lock className="h-5 w-5" />
              <span>Đổi mật khẩu</span>
            </NavLink>
            {/* Affiliate Link */}
            <button
              type="button"
              className={navLinkClass({ isActive: false })}
              onClick={() => setShowAffiliate(true)}
            >
              <span className="flex items-center gap-3">
                <Copy className="h-5 w-5" />
                <span>Tiếp thị liên kết</span>
              </span>
            </button>
          </div>
        </div>
        <div>
          <h4 className="px-4 mb-2 text-xs font-bold uppercase text-secondary tracking-wider">
            Giao Dịch
          </h4>
          <div className="space-y-1">
            <NavLink to="/info/transactions" className={navLinkClass}>
              <Wallet className="h-5 w-5" />
              <span>Lịch sử giao dịch</span>
            </NavLink>
            <NavLink to="/info/orders" className={navLinkClass}>
              <Package className="h-5 w-5" />
              <span>Lịch sử đơn hàng</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-2 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/30 px-4 py-3 rounded-lg font-bold transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
      {/* Affiliate Modal */}
      {showAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAffiliate(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 text-primary">Link tiếp thị liên kết của bạn</h3>
            <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-accent text-white rounded hover:bg-accent/80 text-xs font-semibold"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-secondary mt-2">Gửi link này cho bạn bè, khi họ đăng ký bạn sẽ nhận được hoa hồng!</p>
          </div>
        </div>
      )}
    </aside>
  );
}
