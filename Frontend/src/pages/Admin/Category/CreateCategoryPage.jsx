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
      notification.pop(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.", "e");
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center h-14 justify-between mb-4">
        <Link
          to="/admin/categories"
          className="flex items-center gap-2 text-secondary hover:text-primary"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
        <h2 className="text-2xl font-semibold text-primary text-center flex-1">
          Thêm danh mục mới
        </h2>
        <div className="w-[120px]" /> {/* Placeholder để căn giữa tiêu đề */}
      </div>
      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}
      <CategoryForm onSubmit={handleCreateSubmit} isLoading={isLoading} />
    </div>
  );
}
