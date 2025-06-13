import api from "@utils/http"; // Import axios instance bạn đã cung cấp

/**
 * Lấy danh sách sản phẩm từ server
 * @param {object} params - Các tham số truy vấn như page, limit, search...
 * @returns {Promise<object>}
 */
export const getProducts = (params) => {
  return api.get("/admin/products", { params });
};

/**
 * Lấy thông tin chi tiết của một sản phẩm
 * @param {string|number} id - ID của sản phẩm
 * @returns {Promise<object>}
 */
export const getProductById = (id) => {
  return api.get(`/admin/products/${id}`);
};

/**
 * Tạo một sản phẩm mới
 * @param {object} productData - Dữ liệu sản phẩm từ form
 * @returns {Promise<object>}
 */
export const createProduct = (productData) => {
  // Dữ liệu form thường là multipart/form-data nếu có upload file
  // Nếu chỉ có text, 'application/json' là đủ.
  // API client đã cấu hình header mặc định.
  return api.post("/admin/products", productData);
};

/**
 * Cập nhật thông tin sản phẩm
 * @param {string|number} id - ID của sản phẩm cần cập nhật
 * @param {object} productData - Dữ liệu sản phẩm từ form
 * @returns {Promise<object>}
 */
export const updateProduct = (id, productData) => {
  // Với phương thức PUT/PATCH, đôi khi backend yêu cầu multipart/form-data
  // để xử lý file. Nếu không có file, JSON là đủ.
  // Để hỗ trợ cả hai, thường dùng POST và thêm trường _method: 'PUT'
  // return api.put(`/admin/products/${id}`, productData);
  // Hoặc nếu API hỗ trợ đúng chuẩn PUT/PATCH
  return api.patch(`/admin/products/${id}`, productData);
};

/**
 * Xóa một sản phẩm
 * @param {string|number} id - ID của sản phẩm cần xóa
 * @returns {Promise<object>}
 */
export const deleteProduct = (id) => {
  return api.delete(`/admin/products/${id}`);
};

/**
 * Lấy danh sách tất cả các danh mục
 * @returns {Promise<object>}
 */
export const getCategories = () => {
  return api.get("/admin/categories");
};
