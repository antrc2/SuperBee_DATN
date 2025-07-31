import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // Giữ nguyên import này
import api from "@utils/http";

const DISPUTE_STATUS_MAP = {
  0: {
    text: "Chờ xử lý",
    className:
      "bg-yellow-500/10 text-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-400",
  },
  1: {
    text: "Đang xử lý",
    className:
      "bg-blue-500/10 text-blue-400 dark:bg-blue-900/50 dark:text-blue-400",
  },
  2: {
    text: "Đã giải quyết",
    className:
      "bg-green-500/10 text-green-500 dark:bg-green-900/50 dark:text-green-400",
  },
  3: {
    text: "Đã từ chối",
    className:
      "bg-red-500/10 text-red-500 dark:bg-red-900/50 dark:text-red-400",
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    start_date: "",
    end_date: "",
    page: 1,
  });

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/disputes?${params}`);
      setDisputes(response.data.data);
      setPagination(response.data);
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

  const renderStatus = (status) => {
    const currentStatus = DISPUTE_STATUS_MAP[status] || {
      text: "Không rõ",
      className: "bg-gray-500/20 text-gray-400",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${currentStatus.className}`}
      >
        {currentStatus.text}
      </span>
    );
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="text-center p-10 text-gray-500 dark:text-gray-400">
          Đang tải dữ liệu...
        </div>
      );
    if (error)
      return <div className="text-center p-10 text-red-500">{error}</div>;
    if (disputes.length === 0)
      return (
        <div className="text-center p-10 text-gray-500 dark:text-gray-400">
          Không tìm thấy khiếu nại nào phù hợp.
        </div>
      );

    return (
      <>
        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  #{dispute.id}
                </div>
                {renderStatus(dispute.status)}
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    Mã đơn:
                  </span>{" "}
                  <span className="text-gray-800 dark:text-gray-200">
                    {dispute.order_item?.order?.order_code || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    Người dùng:
                  </span>{" "}
                  <span className="text-gray-800 dark:text-gray-200">
                    {dispute.user?.username || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    Ngày tạo:
                  </span>{" "}
                  <span className="text-gray-800 dark:text-gray-200">
                    {formatDate(dispute.created_at)}
                  </span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                {/* THAY ĐỔI: href -> to */}
                <Link
                  to={`/admin/disputes/${dispute.id}`}
                  className="block w-full text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 py-2 px-4 rounded-lg transition-colors"
                >
                  Xem & Xử lý
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Mã Đơn Hàng
                </th>
                <th scope="col" className="px-6 py-3">
                  Sản phẩm (SKU)
                </th>
                <th scope="col" className="px-6 py-3">
                  Người dùng
                </th>
                <th scope="col" className="px-6 py-3">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((dispute) => (
                <tr
                  key={dispute.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20"
                >
                  <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">
                    #{dispute.id}
                  </td>
                  <td className="px-6 py-4">
                    {dispute.order_item?.order?.order_code || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {dispute.order_item?.product?.sku || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {dispute.user?.username || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(dispute.created_at)}
                  </td>
                  <td className="px-6 py-4">{renderStatus(dispute.status)}</td>
                  <td className="px-6 py-4 text-center">
                    {/* THAY ĐỔI: href -> to */}
                    <Link
                      to={`/admin/disputes/${dispute.id}`}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Xem & Xử lý
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý Khiếu nại
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xem, lọc và xử lý các báo cáo sự cố từ người dùng.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Tìm mã đơn, SKU, email..."
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="0">Chờ xử lý</option>
              <option value="1">Đang xử lý</option>
              <option value="2">Đã giải quyết</option>
              <option value="3">Đã từ chối</option>
            </select>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>{renderContent()}</div>

        {pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
            <p>
              Hiển thị {pagination.from} đến {pagination.to} của{" "}
              {pagination.total} kết quả
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Trước</span>
              </button>
              <span className="px-2">
                Trang {filters.page}/{pagination.last_page}
              </span>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === pagination.last_page}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
