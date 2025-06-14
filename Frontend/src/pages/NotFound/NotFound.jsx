import React from "react";

export default function NotFound() {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="text-center px-6 py-10 bg-white shadow-xl rounded-2xl max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">
          Không tìm thấy trang
        </p>
        <p className="text-gray-500 mb-6">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-300"
        >
          Quay lại trang chủ
        </a>
      </div>
    </div>
  );
}
