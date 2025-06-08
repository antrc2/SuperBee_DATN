import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "@utils/hook";
import api from "@utils/http";
import CategoryForm from "@components/Admin/Category/CategoryForm";

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: categoryData, loading: categoryLoading } = useGet(`/categories/${id}`);

  const handleSave = async (formData) => {
    try {
      const data = {
        name: formData.name,
        parent_id: formData.parent_id || null,
        status: formData.status,
      };

      await api.put(`/categories/${id}`, data);
      navigate("/admin/categories");
    } catch (error) {
      throw error;
    }
  };

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <CategoryForm
      initialData={categoryData?.data}
      onSave={handleSave}
    />
  );
}