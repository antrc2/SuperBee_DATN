// src/services/userService.js
import api from "@utils/http";

// GET /user/profile
export const getUserProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

// GET /user/history-trans
export const getUserTransactionHistory = async () => {
  const response = await api.get("/user/history-trans");
  return response.data;
};

// GET /user/order (có thể là lịch sử đặt hàng của user)
export const getUserOrdersHistory = async () => {
  const response = await api.get("/user/order");
  return response.data;
};
