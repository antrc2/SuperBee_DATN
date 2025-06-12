// @pages/Admin/Products/ProductsPageLayout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { PlusCircle } from "lucide-react";
// Giả sử bạn có component Toast để hiển thị thông báo
// import { Toaster } from 'react-hot-toast';

export default function BannersPageLayout({ children }) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* <Toaster position="top-right" /> */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Banner</h1>
        <Link
          to="/admin/banners/new"
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Thêm banner
        </Link>
      </header>
      <main className="bg-white p-6 rounded-lg shadow-md">
        {/* Các trang con (List, Create, Edit) sẽ được render ở đây */}
        {children}
      </main>
    </div>
  );
}
