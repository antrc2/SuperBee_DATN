// src/services/productService.js
import api from "@utils/http";

// GET /products/{slug} (lấy danh sách sản phẩm theo slug category hoặc các loại khác)
export const getProductsBySlug = async (slug) => {
  const response = await api.get(`/products/${slug}`);
  return response.data;
};

// GET /products/acc/{id} (lấy chi tiết sản phẩm account theo ID)
export const getProductAccById = async (id) => {
  const response = await api.get(`/products/acc/${id}`);
  return response.data;
};
