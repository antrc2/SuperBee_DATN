import React, { useState, useEffect } from "react";
import api from "../../../utils/http";

// Danh sách các định dạng ảnh được phép
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
const ALLOWED_IMAGE_EXTENSIONS = "image/png, image/jpeg, image/webp, image/gif";

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
  const [rootCategories, setRootCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        let cats = res.data?.data;
        if (
          cats &&
          !Array.isArray(cats) &&
          Array.isArray(cats.treeCategories)
        ) {
          cats = cats.treeCategories;
        }
        setRootCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setRootCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        parent_id: initialData.parent_id?.toString() || "",
        status: initialData.status?.toString() || "1",
      });
      setImageFile(null);
      setErrors({});
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = { ...errors }; // Giữ lại các lỗi type checking

    // Rule 1: Tên danh mục không được trống
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Tên danh mục không được để trống.";
    }

    // Rule 2: Phải chọn ảnh khi tạo mới
    if (!isEditing && !imageFile) {
      newErrors.image_url = "Vui lòng chọn hình ảnh cho danh mục.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Xóa lỗi của trường đang được sửa
    const newErrors = { ...errors };
    if (newErrors[name]) {
      delete newErrors[name];
      setErrors(newErrors);
    }

    if (name === "image_url" && files && files[0]) {
      const file = files[0];
      // Rule 3: Kiểm tra định dạng file ngay khi chọn
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [name]:
            "Định dạng không hợp lệ. Chỉ chấp nhận .png, .jpg, .webp, .gif",
        }));
        setImageFile(null);
        e.target.value = ""; // Xóa file đã chọn khỏi input
        return;
      }
      setImageFile(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    const data = new FormData();
    data.append("name", formData.name);
    data.append("parent_id", formData.parent_id);
    data.append("status", formData.status);
    if (imageFile) {
      data.append("image_url", imageFile);
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Basic Info Section */}
      <div className="p-6 border bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Thông tin cơ bản
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tên danh mục
            </label>
            <input
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2.5 rounded-md border bg-gray-50 text-gray-900 focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500"
              }`}
              placeholder="Nhập tên danh mục"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.name}
              </p>
            )}
          </div>
          {/* ... other fields */}
          <div>
            <label
              htmlFor="parent_id"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Danh mục cha
            </label>
            <select
              name="parent_id"
              id="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">-- Không có --</option>
              {rootCategories
                .filter(
                  (cat) =>
                    !(isEditing && initialData && cat.id === initialData.id)
                )
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2.5 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="1">Hoạt động</option>
              <option value="0">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="p-6 border bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Hình ảnh danh mục
        </h3>
        <div>
          <label
            htmlFor="image_url"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Chọn hoặc kéo thả ảnh
          </label>
          <input
            type="file"
            name="image_url"
            id="image_url"
            onChange={handleChange}
            accept={ALLOWED_IMAGE_EXTENSIONS}
            className={`block w-full text-sm text-gray-900 border rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800 ${
              errors.image_url
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {/* Hiển thị lỗi validation cho hình ảnh */}
          {errors.image_url && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.image_url}
            </p>
          )}
        </div>
        <div className="mt-4">
          {initialData && initialData.image_url && !imageFile && (
            <div>
              <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">
                Ảnh hiện tại:
              </p>
              <img
                src={initialData.image_url}
                loading="lazy"
                alt="Current category"
                className="max-w-[200px] h-auto rounded-lg shadow-md border dark:border-gray-600"
              />
            </div>
          )}
          {imageFile && (
            <div>
              <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">
                Ảnh xem trước:
              </p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="New category preview"
                className="max-w-[200px] h-auto rounded-lg shadow-md border dark:border-gray-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:disabled:bg-gray-600"
        >
          {isLoading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
