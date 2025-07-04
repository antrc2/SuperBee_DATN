// src/services/bannerService.js
import api from "@utils/http";

// GET /banners
export const getBanners = async () => {
  const response = await api.get("/banners");
  return response.data;
};
