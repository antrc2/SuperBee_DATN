// ProductsBrowse.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

export default function ProductsBrowse({ products }) {
  // Hàm ánh xạ status sang màu sắc và text, tối ưu cho cả dark và light mode
  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return {
          text: "Đang bán",
          className:
            "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
        };
      case 2:
        return {
          text: "Chờ duyệt",
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
        };
      case 3:
        return {
          text: "Đã hủy",
          className:
            "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
        };
      case 4:
        return {
          text: "Bán thành công",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
        };
      default:
        return {
          text: "Bị từ chối",
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400",
        };
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              SKU
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              Tên sản phẩm (Tạm)
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              Giá bán
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => {
            const statusInfo = getStatusInfo(product.status);
            return (
              <tr
                key={product.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300 font-mono">
                  {product.sku}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                  Sản phẩm #{product.id}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                  {product.import_price?.toLocaleString?.() || 0}đ
                </td>
                <td className="py-4 px-4 text-sm">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                  >
                    {statusInfo.text}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center items-center">
                    <Link
                      to={`/admin/pendingProducts/${product.id}`}
                      title="Xem chi tiết"
                    >
                      <Eye
                        className="text-green-500 hover:text-green-400 dark:text-green-400 dark:hover:text-green-300 cursor-pointer transition-colors"
                        size={22}
                      />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
