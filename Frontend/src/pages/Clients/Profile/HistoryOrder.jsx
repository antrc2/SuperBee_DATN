import React, { useState, useEffect } from "react";
import api from "../../../utils/http";

// --- Dữ liệu mẫu bạn cung cấp ---
// Trong thực tế, bạn sẽ lấy dữ liệu này từ API
const MOCK_API_RESPONSE = [
  {
    id: 2,
    user_id: 5,
    order_code: "435252452",
    total_amount: "345353",
    wallet_transaction_id: 2,
    status: 1, // 1: Hoàn thành, 0: Đang xử lý, 2: Đã hủy
    promo_code: "453",
    discount_amount: "5345",
    created_at: "2025-06-13T10:06:27.000000Z",
    updated_at: "2025-06-13T10:06:28.000000Z",
    items: [
      {
        id: 2,
        order_id: 2,
        product_id: 14,
        unit_price: "555",
        product_name: "Sản phẩm A", // Giả lập thêm tên sản phẩm cho dễ nhìn
        product_image: "https://via.placeholder.com/100", // Giả lập ảnh sản phẩm
      },
      {
        id: 3,
        order_id: 2,
        product_id: 15,
        unit_price: "350143",
        product_name: "Sản phẩm B", // Giả lập thêm tên sản phẩm
        product_image: "https://via.placeholder.com/100", // Giả lập ảnh sản phẩm
      },
    ],
  },
  // Thêm một đơn hàng khác để test filter
  {
    id: 3,
    user_id: 5,
    order_code: "888999111",
    total_amount: "150000",
    wallet_transaction_id: 3,
    status: 0, // Đang xử lý
    promo_code: null,
    discount_amount: "0",
    created_at: "2025-06-12T11:30:00.000000Z",
    updated_at: "2025-06-12T11:30:00.000000Z",
    items: [
      {
        id: 4,
        order_id: 3,
        product_id: 25,
        unit_price: "150000",
        product_name: "Sản phẩm C",
        product_image: "https://via.placeholder.com/100",
      },
    ],
  },
];

// --- Các hàm tiện ích ---
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

// --- Component Modal chi tiết đơn hàng ---
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  // Hàm xử lý khi nhấn nút "Mua sản phẩm tương tự"
  const handleBuySimilar = (productId) => {
    console.log(`Bắt đầu quá trình mua lại sản phẩm có ID: ${productId}`);
    // Tại đây bạn có thể điều hướng người dùng đến trang sản phẩm
    // ví dụ: window.location.href = `/products/${productId}`;
    alert(`Chuyển đến trang của sản phẩm ID: ${productId}`);
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + parseFloat(item.unit_price),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">
            Chi tiết đơn hàng: #{order.order_code}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-2">Danh sách sản phẩm</h4>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-4 flex items-center">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-16 w-16 object-cover rounded mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      ID sản phẩm: {item.product_id}
                    </p>
                    <p className="text-sm text-gray-800">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBuySimilar(item.product_id)}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 whitespace-nowrap"
                  >
                    Mua lại
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-bold text-lg mb-2">Tổng kết</h4>
            <div className="space-y-2 text-right">
              <p>
                <span>Tạm tính:</span>{" "}
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </p>
              <p>
                <span>Giảm giá (Mã: {order.promo_code || "N/A"}):</span>{" "}
                <span className="font-medium text-red-500">
                  - {formatCurrency(order.discount_amount)}
                </span>
              </p>
              <p className="text-xl">
                <span>Thành tiền:</span>{" "}
                <span className="font-bold text-blue-600">
                  {formatCurrency(order.total_amount)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t text-right bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component chính ---
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

  // Lấy dữ liệu khi component được mount
  useEffect(() => {
    // Giả lập API call
    const fetchOrders = async () => {
      const response = await api.get("/user/order");
      const data = response.data;
      console.log("🚀 ~ fetchOrders ~ data:", data);
      //   const data = MOCK_API_RESPONSE;
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAllOrders(sortedData);
      setFilteredOrders(sortedData);
    };
    fetchOrders();
  }, []);

  // Áp dụng bộ lọc
  useEffect(() => {
    let result = allOrders;

    // Lọc theo mã đơn hàng
    if (filters.search) {
      result = result.filter((order) =>
        order.order_code.includes(filters.search)
      );
    }

    // Lọc theo trạng thái
    if (filters.status !== "all") {
      result = result.filter(
        (order) => order.status.toString() === filters.status
      );
    }

    // Lọc theo ngày
    if (filters.startDate) {
      result = result.filter(
        (t) => new Date(t.created_at) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1); // bao gồm cả ngày kết thúc
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>

      {/* --- Khu vực bộ lọc --- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Tìm mã đơn hàng
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="VD: 435252452"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="1">Hoàn thành</option>
              <option value="0">Đang xử lý</option>
              <option value="2">Đã hủy</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Từ ngày
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Đến ngày
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn hàng
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-600">
                    #{order.order_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  Không có đơn hàng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Render Modal --- */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
