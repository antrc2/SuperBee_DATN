"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Calendar,
  Filter,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader,
} from "lucide-react";
import api from "../../../utils/http";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
        <span
          className="px-3 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: "var(--status-success-bg)",
            color: "var(--status-success-text)",
            border: "1px solid var(--status-success-border)",
          }}
        >
          Hoàn thành
        </span>
      );
    case 0:
      return (
        <span
          className="px-3 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: "var(--status-processing-bg)",
            color: "var(--status-processing-text)",
            border: "1px solid var(--status-processing-border)",
          }}
        >
          Đang xử lý
        </span>
      );
    case 2:
      return (
        <span
          className="px-3 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: "var(--status-cancelled-bg)",
            color: "var(--status-cancelled-text)",
            border: "1px solid var(--status-cancelled-border)",
          }}
        >
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
          Không xác định
        </span>
      );
  }
};

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const [expandedItems, setExpandedItems] = useState({});

  const toggleDetails = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number.parseFloat(item.unit_price),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Chi tiết đơn hàng
              </h3>
              <p className="text-slate-400 text-sm">#{order.order_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-4 text-white">
              Danh sách sản phẩm
            </h4>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="flex items-center">
                    <img
                      src={
                        item.product?.images[0]?.image_url || "/placeholder.svg"
                      }
                      alt={item.product_name || "Sản phẩm"}
                      className="h-16 w-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-white">
                        SKU: {item.product?.sku || item.product_id}
                      </p>
                      <p className="text-sm font-medium text-blue-400">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Xem chi tiết
                      {expandedItems[item.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {expandedItems[item.id] && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      {item.product?.credentials &&
                      item.product.credentials.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <h5 className="font-semibold text-white mb-2">
                            Thông tin tài khoản
                          </h5>
                          <div className="bg-slate-800/50 p-3 rounded-lg space-y-2">
                            <p className="text-sm text-slate-300">
                              <span className="font-medium">
                                Tên đăng nhập:
                              </span>{" "}
                              {item.product.credentials[0].username}
                            </p>
                            <div className="text-sm text-slate-300">
                              <span className="font-medium">Mật khẩu:</span>{" "}
                              <input
                                type="text"
                                value={item.product.credentials[0].password}
                                readOnly
                                className="bg-slate-900 text-slate-900 border border-slate-700 p-1 rounded w-auto"
                                onFocus={(e) => e.target.select()}
                              />
                            </div>
                            <i className="text-xs text-slate-400">
                              *Bôi đen ô mật khẩu để xem.
                            </i>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <p className="text-sm text-slate-400">
                            Không có thông tin tài khoản cho sản phẩm này.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="font-bold text-lg mb-4 text-white">Tổng kết</h4>
            <div className="space-y-3 bg-slate-700/30 p-4 rounded-lg">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Giảm giá (Mã: {order.promo_code || "N/A"}):</span>
                <span className="font-medium text-red-400">
                  - {formatCurrency(order.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between text-xl border-t border-slate-600 pt-3 mt-3">
                <span className="text-white font-bold">Thành tiền:</span>
                <span className="font-bold text-blue-400">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/50 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HistoryOrder() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/user/order");
        const data = response.data;
        const sortedData = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAllOrders(sortedData);
        setFilteredOrders(sortedData);
      } catch (err) {
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = allOrders;
    if (filters.search) {
      result = result.filter((order) =>
        order.order_code.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.status !== "all") {
      result = result.filter(
        (order) => order.status.toString() === filters.status
      );
    }
    if (filters.startDate) {
      result = result.filter(
        (t) => new Date(t.created_at) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      result = result.filter((t) => new Date(t.created_at) < endDate);
    }
    setFilteredOrders(result);
  }, [filters, allOrders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = async (order) => {
    try {
      const response = await api.get(`/orders/${order.id}`);
      setSelectedOrder(response.data.data);
    } catch (error) {
      console.error("Failed to fetch order details", error);
      // Optionally, show a toast notification for the error
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader
            className="w-12 h-12 animate-spin mb-4"
            style={{ color: "var(--accent-primary)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <p
          className="text-center p-10"
          style={{ color: "var(--text-secondary)" }}
        >
          Không có đơn hàng nào phù hợp.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-4 rounded-xl border transition-all duration-300"
            style={{
              backgroundColor: "var(--bg-content-900)",
              borderColor: "var(--bg-content-800)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="font-mono text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  #{order.order_code}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatDate(order.created_at)}
                </p>
              </div>
              {renderStatus(order.status)}
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Tổng tiền
                </p>
                <p className="text-lg font-bold text-blue-400">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <button
                onClick={() => handleViewDetails(order)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: "var(--bg-content-900)" }}
    >
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Lịch sử đơn hàng
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Quản lý và theo dõi đơn hàng của bạn
        </p>
      </div>

      <div
        className="p-4 rounded-xl mb-6"
        style={{
          backgroundColor: "var(--bg-content-800)",
          border: "1px solid var(--bg-content-700)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Tìm mã đơn hàng
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
              placeholder="VD: #12345"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">Tất cả</option>
              <option value="1">Hoàn thành</option>
              <option value="0">Đang xử lý</option>
              <option value="2">Đã hủy</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      </div>

      {renderContent()}

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
