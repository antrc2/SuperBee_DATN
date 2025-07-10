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

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600/20 text-blue-400 font-semibold"
        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
    }`;

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full rounded-xl"
      style={{
        backgroundColor: "var(--bg-content-900)",
        border: "1px solid var(--bg-content-800)",
      }}
    >
      <div
        className="p-6 text-center border-b"
        style={{ borderColor: "var(--bg-content-800)" }}
      >
        <div className="relative inline-block mb-4">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-2"
            style={{ borderColor: "var(--accent-primary)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2"
            style={{ borderColor: "var(--bg-content-900)" }}
          ></div>
        </div>
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {user?.name || "username"}
        </h3>
        <div
          className="mt-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-3 border"
          style={{ borderColor: "var(--bg-content-700)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins
              className="h-4 w-4"
              style={{ color: "var(--accent-primary)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Số dư
            </span>
          </div>
          <p
            className="font-bold text-lg text-center"
            style={{ color: "var(--text-primary)" }}
          >
            {formatCurrency(user?.money)}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6">
        <div>
          <h4
            className="px-3 mb-2 text-xs font-semibold uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Tài Khoản
          </h4>
          <NavLink to="/info" end className={navLinkClass}>
            <User className="h-5 w-5" />
            <span>Thông tin</span>
          </NavLink>
          <NavLink to="/info/change-password" className={navLinkClass}>
            <Lock className="h-5 w-5" />
            <span>Đổi mật khẩu</span>
          </NavLink>
        </div>
        <div>
          <h4
            className="px-3 mb-2 text-xs font-semibold uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Giao Dịch
          </h4>
          <NavLink to="/info/transactions" className={navLinkClass}>
            <Wallet className="h-5 w-5" />
            <span>Lịch sử giao dịch</span>
          </NavLink>
          <NavLink to="/info/orders" className={navLinkClass}>
            <Package className="h-5 w-5" />
            <span>Lịch sử đơn hàng</span>
          </NavLink>
        </div>
      </nav>

      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--bg-content-800)" }}
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
