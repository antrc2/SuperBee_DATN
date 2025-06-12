import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CreateFormBanners from "@components/Admin/Banner/CreateFormBanners";
import { LoaderCircle } from "lucide-react";
import api from "@utils/http";

export default function EditBanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/admin/banners/${id}`);
        const bannerData = response.data.data;
        if (bannerData) {
          setBanner(bannerData);
        } else {
          setError("Không tìm thấy banner.");
        }
      } catch (err) {
        console.error(err);
        setError("Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchBanner();
  }, [id]);

  const handleUpdateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      formData.append("_method", "put");
      const response = await api.post(`/admin/banners/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        navigate("/admin/banners");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại."
      );
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
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Chỉnh sửa banner #{banner?.id}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {banner ? (
        <CreateFormBanners
          initialData={banner}
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
