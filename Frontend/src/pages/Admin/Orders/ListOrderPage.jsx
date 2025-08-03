import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "@utils/http";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import Pagination from "../../../components/Pagination/Pagination";

// Import DatePicker và CSS của nó
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ... (Các hàm helper và component con không đổi)
const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );
const StatusBadge = ({ status }) => {
  const styles = {
    1: {
      text: "Hoàn thành",
      classes:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    0: {
      text: "Đang xử lý",
      classes:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    2: {
      text: "Đã hủy",
      classes: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
  };
  const style = styles[status] || {
    text: "Không rõ",
    classes:
      "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.classes}`}
    >
      {style.text}
    </span>
  );
};
const OrderDetails = ({ order }) => (
  <tr className="bg-slate-50 dark:bg-slate-800/50">
    <td colSpan="7" className="p-4">
      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
        Chi tiết sản phẩm:
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {order.items?.map((item) => {
          console.log("🚀 ~ item:", item);
          return (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              <img
                src={item.product.images?.[0]?.image_url || "/placeholder.png"}
                alt="Ảnh sản phẩm"
                className="w-20 h-20 object-cover rounded-md border dark:border-slate-600"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  Mã SP: {item.product.sku}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Giá: {formatCurrency(item.unit_price)}
                </p>
                <Link
                  to={`/admin/products/${item.product.id}`}
                  className="mt-4 ml-1 block"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </td>
  </tr>
);

export default function ListOrderPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const [filters, setFilters] = useState({
    search: queryParams.get("search") || "",
    status: queryParams.get("status") || "",
    start_date: queryParams.get("start_date") || "",
    end_date: queryParams.get("end_date") || "",
    min_amount: queryParams.get("min_amount") || "",
    max_amount: queryParams.get("max_amount") || "",
  });

  const currentPage = parseInt(queryParams.get("page") || "1", 10);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/orders${location.search}`);
      setOrders(response.data.data.data);
      setMeta(response.data.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateUrlParams = useCallback(
    (newFilters) => {
      const params = new URLSearchParams(location.search);
      Object.keys(newFilters).forEach((key) => {
        if (newFilters[key]) {
          params.set(key, newFilters[key]);
        } else {
          params.delete(key);
        }
      });
      if (new URLSearchParams(location.search).get("page")) {
        params.set("page", "1");
      }
      navigate({ search: params.toString() });
    },
    [location.search, navigate]
  );

  useEffect(() => {
    updateUrlParams(debouncedFilters);
  }, [debouncedFilters, updateUrlParams]);

  // VALIDATION VÀ XỬ LÝ THAY ĐỔI
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (
      (name === "min_amount" || name === "max_amount") &&
      parseFloat(value) < 0
    ) {
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm riêng cho DatePicker
  const handleDateChange = (date, name) => {
    const formattedDate = date
      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0]
      : "";
    setFilters((prev) => ({ ...prev, [name]: formattedDate }));
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value !== "").length;
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      start_date: "",
      end_date: "",
      min_amount: "",
      max_amount: "",
    });
  };

  const toggleRow = (orderId) =>
    setExpandedRows((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Quản lý Đơn hàng
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Danh sách các đơn hàng sản phẩm
        </p>
      </header>

      {/* Filter Bar */}
      <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Mã đơn, username..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 lg:col-span-2"
          />

          {/* SỬ DỤNG REACT-DATEPICKER */}
          <DatePicker
            selectsStart
            selected={filters.start_date ? new Date(filters.start_date) : null}
            onChange={(date) => handleDateChange(date, "start_date")}
            startDate={filters.start_date ? new Date(filters.start_date) : null}
            endDate={filters.end_date ? new Date(filters.end_date) : null}
            maxDate={filters.end_date ? new Date(filters.end_date) : null} // Validation
            placeholderText="Từ ngày"
            dateFormat="dd/MM/yyyy"
            isClearable
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <DatePicker
            selectsEnd
            selected={filters.end_date ? new Date(filters.end_date) : null}
            onChange={(date) => handleDateChange(date, "end_date")}
            startDate={filters.start_date ? new Date(filters.start_date) : null}
            endDate={filters.end_date ? new Date(filters.end_date) : null}
            minDate={filters.start_date ? new Date(filters.start_date) : null} // Validation
            placeholderText="Đến ngày"
            dateFormat="dd/MM/yyyy"
            isClearable
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <input
            type="number"
            name="min_amount"
            placeholder="Giá từ..."
            value={filters.min_amount}
            onChange={handleFilterChange}
            min="0"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <input
            type="number"
            name="max_amount"
            placeholder="Giá đến..."
            value={filters.max_amount}
            onChange={handleFilterChange}
            min="0"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoàn thành</option>
            <option value="0">Đang xử lý</option>
            <option value="2">Đã hủy</option>
          </select>

          <button
            onClick={resetFilters}
            className="relative flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <XCircle size={16} />
            Xóa bộ lọc
            {/* HIỂN THỊ SỐ LƯỢNG BỘ LỌC */}
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="w-12 px-2 py-3"></th>
              <th className="px-6 py-3">Mã đơn hàng</th>
              <th className="px-6 py-3">Người mua</th>
              <th className="px-6 py-3">Ngày đặt</th>
              <th className="px-6 py-3">Tổng tiền</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="7" className="p-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-2 text-center">
                      <button
                        onClick={() => toggleRow(order.id)}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        {expandedRows.includes(order.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      #{order.order_code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                      {order.user.username}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-2 inline-block rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                  {expandedRows.includes(order.id) && (
                    <OrderDetails order={order} />
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-16">
                  <ShoppingCart
                    size={48}
                    className="mx-auto mb-2 text-slate-400"
                  />
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && meta && (
        <Pagination
          meta={meta}
          onPageChange={(page) => navigate({ search: `?page=${page}` })}
        />
      )}
    </div>
  );
}
