import React, { useState, useEffect } from "react";
import api from "../../../utils/http";

export default function CategoryForm({
  initialData,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    status: "1",
  });
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        // Đảm bảo categories luôn là mảng
        let cats = res.data?.data;
        // Nếu API trả về object có treeCategories thì lấy treeCategories
        if (cats && !Array.isArray(cats) && Array.isArray(cats.treeCategories)) {
          cats = cats.treeCategories;
        }
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]); // fallback an toàn
      }
    };
    fetchCategories();
  }, []);

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        parent_id: initialData.parent_id?.toString() || "",
        status: initialData.status?.toString() || "1",
      });
      setImageFile(null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image_url" && files && files[0]) {
      setImageFile(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert("Vui lòng nhập tên danh mục.");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("parent_id", formData.parent_id);
    data.append("status", formData.status);

    if (imageFile) {
      data.append("image_url", imageFile);
    }

    onSubmit(data);
  };

  // Render category options
  const renderCategory = (cats, lvl = 0) => {
    if (!Array.isArray(cats)) return null; // Fix lỗi flatMap
    return cats.flatMap((cat) => {
      // Skip current category when editing
      if (isEditing && initialData && cat.id === initialData.id) {
        return [];
      }
      return [
        <option key={cat.id} value={cat.id}>
          {" ".repeat(lvl * 4)}
          {cat.name}
        </option>,
        ...(cat.children ? renderCategory(cat.children, lvl + 1) : []),
      ];
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="p-6 border bg-white rounded shadow-sm">
        <h3 className="mb-4 font-medium text-gray-900">Thông tin cơ bản</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm">
              Tên danh mục
            </label>
            <input
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded border"
              placeholder="Nhập tên danh mục"
            />
          </div>
          <div>
            <label htmlFor="parent_id" className="block mb-1 text-sm">
              Danh mục cha
            </label>
            <select
              name="parent_id"
              id="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            >
              <option value="">-- Không có --</option>
              {renderCategory(categories)}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block mb-1 text-sm">
              Trạng thái
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            >
              <option value="1">Hoạt động</option>
              <option value="0">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image upload */}
      <div className="p-6 border bg-white rounded shadow-sm">
        <h3 className="mb-4 font-medium text-gray-900">Hình ảnh danh mục</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="image_url" className="block mb-1 text-sm">
              Chọn ảnh
            </label>
            <input
              type="file"
              name="image_url"
              id="image_url"
              onChange={handleChange}
              accept="image/*"
              className="w-full p-2 rounded border"
            />
          </div>
          
          {/* Show current image if editing */}
          {initialData && initialData.image_url && !imageFile && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
              <img
                src={`${import.meta.env.VITE_BACKEND_IMG}${initialData.image_url}`}
                alt="Current category"
                className="max-w-[200px] h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          
          {/* Show preview of new image */}
          {imageFile && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Ảnh mới:</p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="New category preview"
                className="max-w-[200px] h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? "Đang lưu..." : isEditing ? "Cập Nhật" : "Tạo Danh Mục"}
        </button>
      </div>
    </form>
  );
}
