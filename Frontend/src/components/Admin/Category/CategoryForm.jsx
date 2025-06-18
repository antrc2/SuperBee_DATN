// @components/Admin/Product/CreateFormProducts.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/http";

// Component này nhận vào:
// - initialData: Dữ liệu ban đầu để điền form (dùng cho chức năng Edit)
// - onSubmit: Hàm sẽ được gọi khi form được gửi đi
// - isEditing: Cờ boolean để biết đây là form sửa hay tạo mới
// - isLoading: Cờ boolean để vô hiệu hóa nút submit khi đang xử lý
export default function CreateFormProducts({
  initialData,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    category_id: "",
    sku: "",
    price: 0,
    sale: 0,
    status: 1,
    username: "", // from product_credentials
    password: "", // from product_credentials
    // Thêm các trường khác ở đây nếu cần
    // Ví dụ: attributes, images
  });
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      setCategories(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);
  useEffect(() => {
    // Nếu có initialData (chế độ edit), điền dữ liệu vào form
    if (initialData) {
      setFormData({
        category_id: initialData.category_id || "",
        sku: initialData.sku || "",
        price: initialData.price || 0,
        sale: initialData.sale || 0,
        status: initialData.status !== undefined ? initialData.status : 1,
        username: initialData.credentials?.username || "",
        password: "", // Không bao giờ điền mật khẩu cũ vào form
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="sku"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SKU
            </label>
            <input
              type="text"
              name="sku"
              id="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Danh mục
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Giá gốc
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="sale"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Giá khuyến mãi (nếu có)
            </label>
            <input
              type="number"
              name="sale"
              id="sale"
              value={formData.sale}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tài khoản đăng nhập
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu {isEditing && "(Bỏ trống nếu không muốn thay đổi)"}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <div className="flex items-center gap-4">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="1"
                  checked={formData.status == 1}
                  onChange={handleChange}
                  className="mr-2"
                />
                Hoạt động
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="0"
                  checked={formData.status == 0}
                  onChange={handleChange}
                  className="mr-2"
                />
                Ẩn
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Phần thuộc tính và hình ảnh sẽ phức tạp hơn, có thể làm component riêng */}
      {/* ... */}

      <div className="pt-6 border-t border-gray-200 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Đang lưu..."
            : isEditing
            ? "Cập Nhật Sản Phẩm"
            : "Tạo Sản Phẩm"}
        </button>
      </div>
    </form>
  );
}
