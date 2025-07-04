// src/services/categoryService.js
import api from "@utils/http";

// GET /categories
export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

// GET /categories/{id}
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};
