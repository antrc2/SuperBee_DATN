import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CategoryForm from "@components/Admin/Category/CategoryForm";
import { LoaderCircle } from "lucide-react";
import api from "../../../utils/http";

export default function EditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

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
        navigate("/admin/categories");
      }
    } catch (err) {
      console.error(err);
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
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Chỉnh sửa danh mục: {category?.name}
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
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
