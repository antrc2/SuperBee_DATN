"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Calendar,
  Filter,
  Eye,
  ShoppingCart,
  X,
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
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          Hoàn thành
        </span>
      );
    case 0:
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          Đang xử lý
        </span>
      );
    case 2:
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
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

  const handleBuySimilar = (productId) => {
    console.log(`Bắt đầu quá trình mua lại sản phẩm có ID: ${productId}`);
    alert(`Chuyển đến trang của sản phẩm ID: ${productId}`);
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
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <img
                    src={item.product_image || "/placeholder.svg"}
                    alt={item.product_name}
                    className="h-16 w-16 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-white">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-slate-400">
                      ID: {item.product_id}
                    </p>
                    <p className="text-sm font-medium text-blue-400">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBuySimilar(item.product_id)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Mua lại
                  </button>
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
              <div className="flex justify-between text-xl border-t border-slate-600 pt-3">
                <span className="text-white font-bold">Thành tiền:</span>
                <span className="font-bold text-blue-400">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
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

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await api.get("/user/order");
      const data = response.data;
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAllOrders(sortedData);
      setFilteredOrders(sortedData);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = allOrders;

    if (filters.search) {
      result = result.filter((order) =>
        order.order_code.includes(filters.search)
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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="container mx-auto ">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Package className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Lịch sử đơn hàng</h1>
            <p className="text-slate-400">
              Quản lý và theo dõi đơn hàng của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <h3 className="font-medium text-white">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Tìm mã đơn hàng
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="VD: 435252452"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="1">Hoàn thành</option>
              <option value="0">Đang xử lý</option>
              <option value="2">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-400">
                      #{order.order_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    Không có đơn hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
