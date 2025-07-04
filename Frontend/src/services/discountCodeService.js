// src/services/discountCodeService.js
import api from "@utils/http";

// GET /discountcode
export const getDiscountCodes = async () => {
  const response = await api.get("/discountcode");
  return response.data;
};

// GET /discountcode/{id}
export const getDiscountCodeById = async (id) => {
  const response = await api.get(`/discountcode/${id}`);
  return response.data;
};
