// src/services/donatePromotionService.js
import api from "@utils/http";

// GET /donate_promotions
export const getDonatePromotions = async () => {
  const response = await api.get("/donate_promotions");
  return response.data;
};

// GET /donate_promotions/{id}
export const getDonatePromotionById = async (id) => {
  const response = await api.get(`/donate_promotions/${id}`);
  return response.data;
};
