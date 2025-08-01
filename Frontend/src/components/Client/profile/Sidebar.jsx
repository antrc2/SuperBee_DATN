"use client";

import { NavLink } from "react-router-dom";
import {
  User,
  Lock,
  Wallet,
  Package,
  LogOut,
  Coins,
  Copy,
  X,
  BanknoteArrowDown,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
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
            <NavLink to="/info/affiliate-history" className={navLinkClass}>
              <Copy className="h-5 w-5" />
              <span>Tiếp thị liên kết</span>
            </NavLink>
            <NavLink to="/info/withdraw" className={navLinkClass}>
              <BanknoteArrowDown className="h-5 w-5" />
              <span>Rút Tiền</span>
            </NavLink>
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
            <NavLink to="/info/disputes" className={navLinkClass}>
              <Package className="h-5 w-5" />
              <span>Lịch sử khiếu lại</span>
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
    </aside>
  );
}
