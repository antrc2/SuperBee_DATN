import React from "react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "@components/Admin/Category/CategoryForm";
import api from "@utils/http";

export default function CreateCategoryPage() {
  const navigate = useNavigate();

  const handleSave = async (data) => {
    try {
      const response = await api.post("/categories", data);
      if (response.status === 201) {
        navigate("/admin/categories");
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <CategoryForm initialData={null} onSave={handleSave} />
    </div>
  );
}
