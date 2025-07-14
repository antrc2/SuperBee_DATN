import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CreateFormProductsPartner from "@components/Partner/Product/CreateFormProductsPartner";
import { LoaderCircle } from "lucide-react";
import api from "../../../utils/http";

export default function EditProductsPartner() {
  const { id } = useParams(); // Lấy id từ URL, ví dụ: /edit/123
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/partner/products/${id}`);
        const productData = response.data.data;
        if (productData && productData.id) {
          // Nếu có game_attributes mà không phải mảng, chuẩn hóa thành mảng
          if (
            productData.game_attributes &&
            !Array.isArray(productData.game_attributes)
          ) {
            productData.game_attributes = [productData.game_attributes];
          }
          // Bổ sung các trường mặc định nếu thiếu
          if (!productData.credentials) productData.credentials = [];
          if (!productData.images) productData.images = [];
          if (!productData.game_attributes) productData.game_attributes = [];
          setProduct(productData);
        } else {
          setProduct(null);
          setError("Sản phẩm không tồn tại.");
        }
      } catch (err) {
        console.error(err);
        setError("Không tìm thấy sản phẩm hoặc có lỗi xảy ra.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    // Backend có thể không muốn nhận mật khẩu rỗng
    // const payload = { ...formData };
    // if (!payload.password) {
    //   delete payload.password;
    // }

    try {
      formData.append("_method", "put");
      await api.post(`/partner/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // if (response.status === 201 || response.status === 200) {
      //   navigate("/admin/categories");
      // }
      // toast.success("Cập nhật sản phẩm thành công!");
      navigate("/partner/products");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại."
      );
      // toast.error(err.response?.data?.message || "Cập nhật thất bại!");
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
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg transition border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-medium">Quay lại</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-2">Chỉnh sửa sản phẩm: #{product?.sku}</h2>
      </div>
      {error && (
        <div className="rounded-lg p-3 mb-4 border bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        {product ? (
          <CreateFormProductsPartner
            initialData={product}
            onSubmit={handleUpdateSubmit}
            isEditing={true}
            isLoading={isLoading}
          />
        ) : (
          <p>{error || "Không có dữ liệu để hiển thị."}</p>
        )}
      </div>
    </div>
  );
}
