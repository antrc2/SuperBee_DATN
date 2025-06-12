import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@utils/http";
import CreateFormBanners from "../../../components/Admin/Banner/CreateFormBanners";

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
      return response.data;
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Thêm banner mới
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <CreateFormBanners onSubmit={handleCreateSubmit} isLoading={isLoading} />
    </div>
  );
}
