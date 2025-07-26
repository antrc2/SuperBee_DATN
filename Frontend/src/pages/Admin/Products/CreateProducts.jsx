// @pages/Admin/Products/CreateProducts.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateFormProducts from "@components/Admin/Product/CreateFormProducts"; // Điều chỉnh đường dẫn
import api from "@utils/http";
import { ArrowLeft } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";

export default function CreateProducts() {
  const navigate = useNavigate();
  const { pop } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        pop("Tạo sản phẩm thành công!", "s");
        navigate("/admin/products");
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
    <div>
      <div className="flex items-center h-14">
        <div className="flex items-center  ">
          <Link
            to="/admin/products"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </Link>
        </div>
        <h2 className="text-2xl font-semibold mb-4 ml-4 mt-3 text-gray-700">
          Thêm sản phẩm mới
        </h2>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <CreateFormProducts onSubmit={handleCreateSubmit} isLoading={isLoading} />
    </div>
  );
}
