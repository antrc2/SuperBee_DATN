// src/services/homeService.js
import api from "@utils/http";

// GET /home
export const getHomeData = async () => {
  const response = await api.get("/home");
  return response.data;
};
export const getNotification = async () => {
  const response = await api.get("/notifications");
  return response.data;
};
