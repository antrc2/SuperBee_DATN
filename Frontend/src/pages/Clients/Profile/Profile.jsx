import React from "react";

export default function Profile() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Thông tin tài khoản</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ID tài khoản
          </label>
          <input
            type="text"
            value="2049356"
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số dư tài khoản
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value="0"
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="button"
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Gửi
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value="hikariuisu"
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h2 className="text-xl font-bold mb-2">Thông Tin Chung</h2>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Về chúng tôi</li>
          <li>Chính sách bảo mật</li>
        </ul>
      </div>
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h2 className="text-xl font-bold mb-2">Sản Phẩm</h2>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Nick Hoàng Quân Gift Rồi trending hôm nay</li>
        </ul>
      </div>
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h2 className="text-xl font-bold mb-2">Hỗ Trợ Khách Hàng</h2>
        <p className="text-gray-600">Liên hệ: 19001234</p>
        <p className="text-gray-600">
          <a href="https://facebook.com" className="text-blue-600 underline">
            Facebook
          </a>
        </p>
      </div>
    </div>
  );
}
