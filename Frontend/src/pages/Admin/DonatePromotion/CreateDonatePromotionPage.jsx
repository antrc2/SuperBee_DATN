// src/pages/Admin/DonatePromotions/CreateDonatePromotionPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DonatePromotionForm from "@components/Admin/DonatePromotion/DonatePromotionForm";
import api from "@utils/http";
import { ArrowLeft } from "lucide-react";

export default function CreateDonatePromotionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Logic xử lý submit form, không thay đổi
  const handleCreateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/admin/donate_promotions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201 || response.status === 200) {
        navigate("/admin/donatePromotions");
      }
    } catch (err) {
      // Hiển thị lỗi từ server nếu có, nếu không thì hiển thị lỗi chung
      setError(
        err.response?.data?.message ||
          "Có lỗi không mong muốn xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Sử dụng space-y-6 để tạo khoảng cách 1.5rem giữa các phần tử con
    <div className="space-y-6">
      {/* Phần Header của trang */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Tạo mã khuyến mãi mới
        </h1>
        <Link
          to="/admin/donatePromotions"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
      </div>

      {/* Vùng hiển thị lỗi nếu có */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {/* Container cho Form, tạo hiệu ứng card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
        <DonatePromotionForm
          onSubmit={handleCreateSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
