import React from "react";

export default function ChangePassword() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Đổi mật khẩu</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu hiện tại"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mật khẩu mới
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}
