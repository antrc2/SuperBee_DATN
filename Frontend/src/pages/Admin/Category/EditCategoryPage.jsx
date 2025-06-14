import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "@utils/hook";
import api from "@utils/http";
import CategoryForm from "@components/Admin/Category/CategoryForm";

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: categoryData, loading: categoryLoading } = useGet(
    `/categories/${id}`
  );

  const handleSave = async (data) => {
    try {
      data.append("_method", "PUT");
      const response = await api.post(`/admin/categories/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        navigate("/admin/categories");
      }
      return response.data;
    } catch (error) {
      console.error(
        "Error creating category:",
        error.response?.data || error.message
      );
      // Ném lỗi ra ngoài để `CategoryForm` có thể bắt và hiển thị
      throw new Error(
        error.response?.data?.message || "Failed to save category"
      );
    }
  };

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <CategoryForm initialData={categoryData?.data} onSave={handleSave} />;
}
