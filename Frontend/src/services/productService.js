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

// GET /products/filter/{slug} (lấy danh sách sản phẩm với bộ lọc)
export const getProductsWithFilter = async (slug, filters) => {
  const params = new URLSearchParams();
  if (filters.key) params.append("key", filters.key);
  if (filters.sku) params.append("sku", filters.sku);
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.min_price) params.append("min_price", filters.min_price);
  if (filters.max_price) params.append("max_price", filters.max_price);
  if (filters.attribute_key) params.append("attribute_key", filters.attribute_key);
  if (filters.attribute_value) params.append("attribute_value", filters.attribute_value);
  if (filters.sortBy && filters.sortBy !== "newest") {
    params.append("sortBy", filters.sortBy);
  }
  if (filters.page && filters.page !== 1) {
    params.append("page", filters.page);
  }
  if (filters.limit) {
    params.append("limit", filters.limit);
  }
  const response = await api.get(`/products/filter/${slug}?${params}`);
  return response.data;
};
