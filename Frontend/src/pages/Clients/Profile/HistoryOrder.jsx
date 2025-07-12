"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader,
} from "lucide-react";
import api from "../../../utils/http";

// --- TIỆN ÍCH ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) amount = 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- COMPONENT CON: MODAL CHI TIẾT ĐƠN HÀNG ---
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
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-themed flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                Chi tiết đơn hàng
              </h3>
              <p className="text-secondary text-sm font-mono">
                #{order.order_code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h4 className="font-heading text-lg font-bold text-primary mb-4">
              Danh sách sản phẩm
            </h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-background/50 rounded-lg border border-themed"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.product?.images[0]?.image_url || "/placeholder.svg"
                      }
                      alt={item.product_name || "Sản phẩm"}
                      className="h-16 w-16 object-cover rounded-lg border border-themed"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-primary">
                        SKU: {item.product?.sku || item.product_id}
                      </p>
                      <p className="text-sm font-bold text-accent">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="action-button action-button-secondary !w-auto !py-2 !px-3 !text-sm"
                    >
                      {expandedItems[item.id] ? "Ẩn" : "Xem"}
                      {expandedItems[item.id] ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </div>

                  {expandedItems[item.id] && (
                    <div className="mt-4 pt-4 border-t border-themed">
                      {item.product?.credentials &&
                      item.product.credentials.length > 0 ? (
                        <div>
                          <h5 className="font-semibold text-primary mb-2">
                            Thông tin tài khoản
                          </h5>
                          <div className="bg-input p-3 rounded-lg space-y-2 border border-themed">
                            <p className="text-sm text-secondary">
                              <span className="font-medium text-primary">
                                Tên đăng nhập:
                              </span>{" "}
                              {item.product.credentials[0].username}
                            </p>
                            <div className="text-sm text-secondary">
                              <span className="font-medium text-primary">
                                Mật khẩu:
                              </span>{" "}
                              <input
                                type="text"
                                value={item.product.credentials[0].password}
                                readOnly
                                className="bg-background text-primary border border-themed p-1 rounded w-auto selection:bg-accent selection:text-accent-contrast"
                                onFocus={(e) => e.target.select()}
                              />
                            </div>
                            <i className="text-xs text-secondary/70">
                              *Click vào ô mật khẩu để copy.
                            </i>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-secondary">
                          Không có thông tin chi tiết cho sản phẩm này.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-themed pt-6">
            <h4 className="font-heading text-lg font-bold text-primary mb-4">
              Tổng kết
            </h4>
            <div className="space-y-3 bg-background/50 p-4 rounded-lg border border-themed">
              <div className="flex justify-between text-secondary">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Giảm giá (Mã: {order.promo_code || "N/A"}):</span>
                <span className="font-medium text-red-400">
                  - {formatCurrency(order.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between text-xl border-t border-themed pt-3 mt-3">
                <span className="text-primary font-bold">Thành tiền:</span>
                <span className="font-bold text-accent">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-themed bg-background/50 text-right flex-shrink-0">
          <button
            onClick={onClose}
            className="action-button action-button-secondary !w-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH: LỊCH SỬ ĐƠN HÀNG ---
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
        const sortedData = response.data.sort(
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
    let result = allOrders.filter(
      (order) =>
        order.order_code.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.status === "all" ||
          order.status.toString() === filters.status) &&
        (!filters.startDate ||
          new Date(order.created_at) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(order.created_at) <=
            new Date(
              new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            ))
    );
    setFilteredOrders(result);
  }, [filters, allOrders]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleViewDetails = async (order) => {
    try {
      const response = await api.get(`/orders/${order.id}`);
      setSelectedOrder(response.data.data);
    } catch (error) {
      console.error("Failed to fetch order details", error);
    }
  };

  const renderStatus = (status) => {
    const statusMap = {
      1: {
        text: "Hoàn thành",
        className: "bg-status-success-bg text-status-success-text",
      },
      0: {
        text: "Đang xử lý",
        className: "bg-status-processing-bg text-status-processing-text",
      },
      2: {
        text: "Đã hủy",
        className: "bg-status-cancelled-bg text-status-cancelled-text",
      },
    };
    const currentStatus = statusMap[status] || {
      text: "Không xác định",
      className: "bg-gray-500/20 text-gray-400",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full ${currentStatus.className}`}
      >
        {currentStatus.text}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader className="w-12 h-12 animate-spin text-accent mb-4" />
          <p className="text-secondary">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center p-10 bg-background rounded-lg border border-themed">
          <Package className="w-12 h-12 mx-auto text-secondary/50 mb-4" />
          <p className="text-secondary">Không có đơn hàng nào phù hợp.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-background p-4 rounded-xl border border-themed transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm text-secondary">
                  #{order.order_code}
                </p>
                <p className="font-semibold text-primary">
                  {formatDate(order.created_at)}
                </p>
              </div>
              {renderStatus(order.status)}
            </div>
            <div className="mt-4 pt-4 border-t border-themed flex justify-between items-end">
              <div>
                <p className="text-sm text-secondary">Tổng tiền</p>
                <p className="text-xl font-bold text-accent">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <button
                onClick={() => handleViewDetails(order)}
                className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
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
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          Lịch sử Đơn hàng
        </h1>
        <p className="text-secondary mt-1">
          Theo dõi và quản lý tất cả các đơn hàng đã mua của bạn.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-background p-4 rounded-xl border border-themed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Mã đơn hàng
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover placeholder-theme"
              placeholder="VD: #12345"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            >
              <option value="all">Tất cả</option>
              <option value="1">Hoàn thành</option>
              <option value="0">Đang xử lý</option>
              <option value="2">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[20rem]">{renderContent()}</div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}
