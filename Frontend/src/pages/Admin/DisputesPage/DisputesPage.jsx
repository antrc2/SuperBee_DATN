// src/pages/Admin/Disputes/DisputesPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "@utils/http";
import {
  Loader2,
  Eye,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

// --- Component con để render trạng thái (Nâng cấp giao diện Dark Mode) ---
const DisputeStatus = ({ status }) => {
  const statusMap = {
    0: {
      text: "Chờ xử lý",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    1: {
      text: "Đang xử lý",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    2: {
      text: "Hoàn thành",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    3: {
      text: "Không chấp nhận",
      className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
    // Thêm các trạng thái khác nếu cần
  };
  const current = statusMap[status] || {
    text: "Không rõ",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${current.className}`}
    >
      {current.text}
    </span>
  );
};

// --- Component chính của trang ---
export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    page: 1,
  });

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/disputes?${params}`);
      const responseData = response.data;

      if (responseData?.data && Array.isArray(responseData.data.data)) {
        setDisputes(responseData.data.data);
        setPagination(responseData.data);
      } else {
        setDisputes([]);
        setPagination(null);
      }
    } catch (err) {
      setError("Không thể tải danh sách khiếu nại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (pagination && newPage > 0 && newPage <= pagination.last_page) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="m-4 flex flex-col items-center justify-center text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="font-medium">{error}</p>
        </div>
      );
    }
    if (disputes.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Inbox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">Không tìm thấy khiếu nại</h3>
          <p className="mt-1 text-sm">
            Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sản phẩm (SKU)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {disputes.map((dispute) => (
              <tr
                key={dispute.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                  #{dispute.id}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {dispute.user?.username}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {dispute.order_item?.product?.sku || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <DisputeStatus status={dispute.status} />
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {new Date(dispute.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/admin/disputes/${dispute.id}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm"
                  >
                    <Eye size={16} />
                    <span>Xem chi tiết</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Quản lý Khiếu nại</h1>

      {/* Thanh công cụ lọc */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tìm kiếm
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="ID, Tên người dùng..."
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="0">Chờ xử lý</option>
              <option value="1">Đang xử lý</option>
              <option value="1">Hoàn thành</option>
              <option value="1">Không chấp nhận</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {renderContent()}
      </div>

      {/* Thanh phân trang */}
      {pagination && pagination.total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700 dark:text-gray-400 gap-4">
          <p>
            Hiển thị từ <strong>{pagination.from}</strong> đến{" "}
            <strong>{pagination.to}</strong> trong tổng số{" "}
            <strong className="text-gray-900 dark:text-gray-100">
              {pagination.total}
            </strong>{" "}
            kết quả
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
