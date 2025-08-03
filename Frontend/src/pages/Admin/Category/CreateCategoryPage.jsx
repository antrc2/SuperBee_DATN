import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CategoryForm from "@components/Admin/Category/CategoryForm";
import api from "@utils/http";
import { ArrowLeft } from "lucide-react";
import { useNotification } from "@contexts/NotificationContext";

export default function CreateCategoryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const notification = useNotification();

  const handleCreateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/admin/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        notification.pop("Tạo danh mục thành công!", "s");
        navigate("/admin/categories");
      }
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      notification.pop(errorMessage, "e");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Thêm màu nền cho dark mode
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center h-14 justify-between mb-4">
        <Link
          to="/admin/categories"
          // Cập nhật màu chữ cho link ở dark mode
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center flex-1">
          Thêm danh mục mới
        </h2>
        <div className="w-[150px]" /> {/* Placeholder để căn giữa tiêu đề */}
      </div>

      {/* Tối ưu giao diện cho thông báo lỗi và thêm dark mode */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <CategoryForm onSubmit={handleCreateSubmit} isLoading={isLoading} />
    </div>
  );
}
