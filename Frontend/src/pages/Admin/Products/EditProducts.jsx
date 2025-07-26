// @pages/Admin/Products/EditProducts.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CreateFormProducts from "@components/Admin/Product/CreateFormProducts"; // Điều chỉnh đường dẫn
import { LoaderCircle } from "lucide-react";
import api from "../../../utils/http";
import { useNotification } from "../../../contexts/NotificationContext";

export default function EditProducts() {
  const { id } = useParams(); // Lấy id từ URL, ví dụ: /edit/123
  const navigate = useNavigate();
  const { pop } = useNotification();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/admin/products/${id}`);
        const productData = response.data.data;
        if (Array.isArray(productData) && productData.length > 0) {
          // Lấy sản phẩm đầu tiên từ mảng data và chuẩn hóa game_attributes thành mảng nếu cần
          const productItem = productData[0];
          if (
            productItem.game_attributes &&
            !Array.isArray(productItem.game_attributes)
          ) {
            productItem.game_attributes = [productItem.game_attributes];
          }
          setProduct(productItem);
        } else {
          setProduct(null);
          setError("Sản phẩm không tồn tại.");
          pop("Sản phẩm không tồn tại.", "e");
        }
      } catch (err) {
        console.error(err);
        const errorMessage = "Không tìm thấy sản phẩm hoặc có lỗi xảy ra.";
        setError(errorMessage);
        pop(errorMessage, "e");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id, pop]);

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
      const response = await api.post(`/admin/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        pop("Cập nhật sản phẩm thành công!", "s");
        navigate("/admin/products");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.";
      setError(errorMessage);
      pop(errorMessage, "e");
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
    <div>
      {/* <div className="flex items-center h-14">
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
        
      </div> */}
      <h2 className="text-2xl font-semibold mb-4 text-xl-700">
        Chỉnh sửa sản phẩm: #{product?.sku}
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {product ? (
        <CreateFormProducts
          initialData={product}
          onSubmit={handleUpdateSubmit}
          isEditing={true}
          isLoading={isLoading}
        />
      ) : (
        <p>{error || "Không có dữ liệu để hiển thị."}</p>
      )}
    </div>
  );
}
