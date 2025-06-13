import React, { useState, useEffect } from "react";
import api from "@utils/http";
import { Link } from "react-router-dom";

// --- Các hàm tiện ích ---
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const renderStatus = (status) => {
  switch (status) {
    case 1:
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Hoàn thành
        </span>
      );
    case 0:
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Đang xử lý
        </span>
      );
    case 2:
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          Không xác định
        </span>
      );
  }
};

// --- Component Phân trang ---
const Pagination = ({ links, onPageChange, currentPage, lastPage }) => {
  if (!links || links.length <= 3) return null; // Không hiển thị nếu chỉ có 1 trang

  const handlePageClick = (link) => {
    if (link.url) {
      const pageNumber = new URL(link.url).searchParams.get("page");
      if (pageNumber) {
        onPageChange(parseInt(pageNumber));
      }
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="flex items-center justify-between"
    >
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 disabled:opacity-50"
        >
          &laquo; Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 leading-5 rounded-md hover:text-gray-500 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150 disabled:opacity-50"
        >
          Next &raquo;
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <span className="relative z-0 inline-flex shadow-sm rounded-md">
            {links.map((link, index) => (
              <button
                key={index}
                onClick={() => handlePageClick(link)}
                disabled={!link.url}
                className={`relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium border
                                ${
                                  link.active
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                }
                                ${
                                  !link.url
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : ""
                                }
                                ${index === 0 ? "rounded-l-md" : ""}
                                ${
                                  index === links.length - 1
                                    ? "rounded-r-md"
                                    : ""
                                }
                                border-gray-300 focus:z-10 focus:outline-none focus:ring ring-gray-300 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150`}
                // Sử dụng dangerouslySetInnerHTML vì label từ Laravel có thể chứa HTML entities
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </span>
        </div>
      </div>
    </nav>
  );
};

// --- Component Chính ---
export default function ListOrderPage() {
  const [ordersData, setOrdersData] = useState({
    data: [],
    links: [],
    total: 0,
    from: 0,
    to: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all" });
  const [currentPage, setCurrentPage] = useState(1);

  // Effect để gọi API mỗi khi trang hoặc bộ lọc thay đổi
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage });
        if (filters.status !== "all") {
          params.append("status", filters.status);
        }

        // Thay thế '/api/admin/orders' bằng endpoint thật của bạn
        const response = await api.get("/admin/orders");

        // Dựa trên cấu trúc JSON bạn cung cấp
        setOrdersData(response.data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        // Có thể thêm state để xử lý lỗi và hiển thị cho người dùng
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    // Khi thay đổi bộ lọc, quay về trang 1
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Quản lý đơn hàng
      </h1>

      {/* --- Khu vực bộ lọc --- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="w-full md:w-1/3">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Lọc theo trạng thái
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Hoàn thành</option>
            <option value="0">Đang xử lý</option>
            <option value="2">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* --- Bảng Dữ liệu --- */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : ordersData.data.length > 0 ? (
                ordersData.data.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-blue-600">
                      #{order.order_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Thanh phân trang --- */}
      {!loading && ordersData.data.length > 0 && (
        <div className="mt-6 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-lg shadow-md">
          <div className="flex-1 flex justify-between sm:hidden">
            {/* Mobile Pagination handled inside component */}
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị từ{" "}
                <span className="font-medium">{ordersData.from || 0}</span> đến{" "}
                <span className="font-medium">{ordersData.to || 0}</span> trên{" "}
                <span className="font-medium">{ordersData.total || 0}</span> kết
                quả
              </p>
            </div>
            <div>
              <Pagination
                links={ordersData.links}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                lastPage={ordersData.last_page}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
