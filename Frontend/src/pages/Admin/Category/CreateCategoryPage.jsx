import React from "react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "@components/Admin/Category/CategoryForm";
import api from "@utils/http";

export default function CreateCategoryPage() {
  const navigate = useNavigate();

  const handleSave = async (data) => {
    console.log("🚀 ~ handleSave ~ data:", data);
    try {
      const response = await api.post("/categories", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
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

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <CategoryForm initialData={null} onSave={handleSave} />
    </div>
  );
}
