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
} from "lucide-react"; // Thêm các icon cần thiết

// Component con để render trạng thái, giúp code gọn hơn
const DisputeStatus = ({ status }) => {
  const statusMap = {
    0: { text: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
    1: { text: "Đã xử lý", className: "bg-green-100 text-green-800" },
  };
  const current = statusMap[status] || {
    text: "Không rõ",
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${current.className}`}
    >
      {current.text}
    </span>
  );
};

// Component chính của trang
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

      // =================================================================
      // SỬA LỖI QUAN TRỌNG TẠI ĐÂY
      // =================================================================
      const responseData = response.data; // Dữ liệu từ Axios

      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data.data)
      ) {
        // Lấy đúng mảng dữ liệu nằm trong: response.data.data.data
        setDisputes(responseData.data.data);

        // Lấy object phân trang nằm trong: response.data.data
        setPagination(responseData.data);
      } else {
        setDisputes([]);
        setPagination(null);
      }
    } catch (err) {
      setError("Không thể tải danh sách khiếu nại. Vui lòng thử lại.");
      console.error(err);
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
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex justify-center items-center h-60 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-6 w-6 mr-2" /> {error}
        </div>
      );
    }
    if (disputes.length === 0) {
      return (
        <div className="text-center p-10 text-gray-500">
          Không tìm thấy khiếu nại nào phù hợp.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sản phẩm (SKU)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  #{dispute.id}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {dispute.user?.username}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {dispute.order_item?.product?.sku || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <DisputeStatus status={dispute.status} />
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(dispute.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-center">
                  {/* CẢI TIẾN GIAO DIỆN: Thêm icon vào nút hành động */}
                  <Link
                    to={`/admin/disputes/${dispute.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <Eye size={18} />
                    <span>Xem</span>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Quản lý Khiếu nại
      </h1>

      {/* Thanh công cụ lọc */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tìm kiếm
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              {/* CẢI TIẾN GIAO DIỆN: Thêm padding cho input */}
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="ID, Tên người dùng..."
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Trạng thái
            </label>
            {/* CẢI TIẾN GIAO DIỆN: Thêm padding cho select */}
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="0">Chờ xử lý</option>
              <option value="1">Đã xử lý</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {renderContent()}
      </div>

      {/* Thanh phân trang */}
      {pagination && pagination.total > 0 && (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-700">
          <p>
            Hiển thị từ <strong>{pagination.from}</strong> đến{" "}
            <strong>{pagination.to}</strong> trong tổng số{" "}
            <strong>{pagination.total}</strong> kết quả
          </p>
          <div className="flex items-center gap-2">
            {/* CẢI TIẾN GIAO DIỆN: Thêm icon vào nút phân trang */}
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
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
