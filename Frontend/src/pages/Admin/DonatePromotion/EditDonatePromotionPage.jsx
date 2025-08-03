import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DonatePromotionForm from "@components/Admin/DonatePromotion/DonatePromotionForm";
import { LoaderCircle,ArrowLeft } from "lucide-react";
import api from "@utils/http";

export default function EditDonatePromotion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      setIsFetching(true);
      try {
        const res = await api.get(`/admin/donate_promotions/${id}`);
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setPromotion(data[0]);
        } else {
          setPromotion(null);
          setError("Không tìm thấy khuyến mãi.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải khuyến mãi.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPromotion();
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsLoading(true);
    try {
      formData.append("_method", "put");
      const res = await api.post(`/admin/donate_promotions/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        navigate("/admin/donatePromotions");
      }
    } catch (err) {
      console.error(err);
      setError("Cập nhật thất bại.");
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
      <div className="flex items-center h-14">
        <div className="flex items-center  ">
          <Link
            to="/admin/donatePromotions"
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
      {promotion ? (
        <DonatePromotionForm
          initialData={promotion}
          onSubmit={handleUpdate}
          isEditing={true}
          isLoading={isLoading}
        />
      ) : (
        <p>{error || "Không có dữ liệu để hiển thị."}</p>
      )}
    </div>
  );
}
