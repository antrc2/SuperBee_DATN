import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CategoryForm from "@components/Admin/Category/CategoryForm";
import { LoaderCircle } from "lucide-react";
import api from "../../../utils/http";
import { useNotification } from "@contexts/NotificationContext";
import { ArrowLeft } from "lucide-react";

export default function EditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const notification = useNotification();

  useEffect(() => {
    const fetchCategory = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/admin/categories/${id}`);
        const categoryData = response.data.data;
        setCategory(categoryData);
      } catch (err) {
        console.error(err);
        setError("Không tìm thấy danh mục hoặc có lỗi xảy ra.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleUpdateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      formData.append("_method", "put");
      const response = await api.post(`/admin/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        notification.pop("Cập nhật danh mục thành công!", "s");
        navigate("/admin/categories");
      }
    } catch (err) {
      notification.pop(err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.", "e");
      setError(
        err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center h-14 mb-4 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-primary px-2 py-1 rounded"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h2 className="text-2xl font-semibold text-primary text-center flex-1">
          Chỉnh sửa danh mục: {category?.name}
        </h2>
        <div className="w-[120px]" />
      </div>
      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}
      {category ? (
        <CategoryForm
          initialData={category}
          onSubmit={handleUpdateSubmit}
          isEditing={true}
          isLoading={isLoading}
        />
      ) : (
        <p>{error || "Không có dữ liệu để hiển thị."}</p>
      )}
    </div>
  );
}
