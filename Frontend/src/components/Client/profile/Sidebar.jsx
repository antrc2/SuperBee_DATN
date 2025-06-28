"use client";

import { NavLink } from "react-router-dom";
import { User, Lock, Wallet, Package, LogOut, Coins } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className="w-64 flex flex-col h-full border-r shadow-lg"
      style={{
        background: "var(--color-dark-surface)",
        borderColor: "var(--color-dark-border)",
      }}
    >
      {/* User Profile Section */}
      <div
        className="p-6 border-b"
        style={{ borderColor: "var(--color-dark-border)" }}
      >
        <div className="flex items-end justify-start gap-2">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-blue-500/30 shadow-lg">
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800"></div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-3">
              {user?.name || "username"}
            </p>
          </div>
        </div>
      </div>
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3 border border-blue-500/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Coins className="h-4 w-4 text-yellow-400" />
          <span className="text-slate-300 text-xs font-medium">Số dư</span>
        </div>
        <p className="text-white font-bold text-lg text-center">
          {formatCurrency(user?.money)}
        </p>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Account Menu */}
        <div className="mb-6">
          <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3 px-2">
            Tài Khoản
          </h3>
          <nav className="space-y-1">
            <NavLink
              to="/info"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`
              }
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Thông tin tài khoản</span>
            </NavLink>

            <NavLink
              to="/info/change-password"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`
              }
            >
              <Lock className="h-5 w-5" />
              <span className="font-medium">Đổi mật khẩu</span>
            </NavLink>
          </nav>
        </div>

        {/* Transaction Menu */}
        <div>
          <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3 px-2">
            Giao Dịch
          </h3>
          <nav className="space-y-1">
            <NavLink
              to="/info/transactions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`
              }
            >
              <Wallet className="h-5 w-5" />
              <span className="font-medium">Lịch sử giao dịch</span>
            </NavLink>

            <NavLink
              to="/info/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`
              }
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Lịch sử đơn hàng</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Logout Button */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--color-dark-border)" }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-4 py-3 rounded-lg font-medium transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
