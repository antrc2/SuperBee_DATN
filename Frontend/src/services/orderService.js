// src/services/orderService.js
import api from "@utils/http";

// GET /orders
export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// GET /orders/checkout (Có thể dùng để lấy thông tin trước khi thanh toán, ví dụ: tổng tiền, phí ship)
export const getOrderCheckoutInfo = async () => {
  const response = await api.get("/orders/checkout");
  return response.data;
};

// GET /orders/{id} (Lấy chi tiết một đơn hàng cụ thể)
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};
