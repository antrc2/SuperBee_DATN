import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@utils/http"; // Cập nhật đường dẫn nếu cần
import CreateFormBanners from "../../../components/Admin/Banner/CreateFormBanners"; // Cập nhật đường dẫn nếu cần
import { ArrowLeft } from "lucide-react"; // Thêm icon ArrowLeft

export default function CreateBanner() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/admin/banners", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        navigate("/admin/banners");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Tạo banner thất bại, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- NÚT QUAY LẠI ---
  const handleGoBack = () => navigate(-1);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleGoBack}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Thêm banner mới
        </h1>
      </div>

      {error && (
        <div
          className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-900 dark:border-red-700 dark:text-red-300"
          role="alert"
        >
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <CreateFormBanners onSubmit={handleCreateSubmit} isLoading={isLoading} />
    </div>
  );
}
