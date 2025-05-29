import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <img
          src="https://via.placeholder.com/40"
          alt="Avatar"
          className="w-10 h-10 rounded-full mb-2 mx-auto"
        />
        <p className="text-sm text-gray-600 text-center">hikariuisu</p>
        <p className="text-sm text-gray-600">Số dư: 0đ</p>
        <p className="text-sm text-gray-600">Số dư Acoin: 0 Acoin</p>
        <p className="text-sm text-gray-600">ID: 2049356</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-2">Menu Tài Khoản</h2>
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/info"
              className={({ isActive }) =>
                ` flex items-center p-2 rounded-lg ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm0 9a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Thông tin tài khoản
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/info/change-password"
              className={({ isActive }) =>
                ` flex items-center p-2 rounded-lg ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Đổi mật khẩu
            </NavLink>
          </li>
        </ul>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Menu Giao Dịch</h2>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/info/transactions"
                className={({ isActive }) =>
                  ` flex items-center p-2 rounded-lg ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Lịch sử giao dịch
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/top-up-atm"
                className={({ isActive }) =>
                  ` flex items-center p-2 rounded-lg ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h3m-5 0v-5m5 5v-5m1 15l-1-1m0 0l-1 1m1-1h3m-3 0h8m0-15v12a7 7 0 01-7 7h-4a7 7 0 01-7-7V3"
                  />
                </svg>
                Nạp thẻ ATM
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="p-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg w-full">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
