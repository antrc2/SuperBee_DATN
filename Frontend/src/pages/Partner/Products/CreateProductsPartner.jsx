import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateFormProductsPartner from "@components/Partner/Product/CreateFormProductsPartner";
import api from "@utils/http";
import { ArrowLeft } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";

export default function CreateProductsPartner() {
  const navigate = useNavigate();
  const { pop } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/partner/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        pop("Tạo sản phẩm thành công!", "s");
        navigate("/partner/products");
      }
      return response.data;
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      setError(errorMessage);
      pop(errorMessage, "e");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/partner/products"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại danh sách</span>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-2">Thêm sản phẩm mới</h2>
      </div>
      {error && (
        <div className="rounded-lg p-3 mb-4 border bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <CreateFormProductsPartner onSubmit={handleCreateSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
