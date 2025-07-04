// src/services/cartService.js
import api from "@utils/http";

// GET /carts
export const getCart = async () => {
  const response = await api.get("/carts");
  return response.data;
};

// DELETE /carts/{id} (Xóa sản phẩm khỏi giỏ hàng)
export const deleteCartItem = async (id) => {
  await api.delete(`/carts/${id}`);
};
