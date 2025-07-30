import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CreateFormBanners from "@components/Admin/Banner/CreateFormBanners"; // Cập nhật đường dẫn nếu cần
import { LoaderCircle, ArrowLeft } from "lucide-react"; // Thêm icon ArrowLeft
import api from "@utils/http"; // Cập nhật đường dẫn nếu cần

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
      setError(null);
      try {
        const response = await api.get(`/admin/banners/${id}`);
        const bannerData = response.data.data;
        if (bannerData) {
          setBanner(bannerData);
        } else {
          setError("Không tìm thấy banner được yêu cầu.");
        }
      } catch (err) {
        console.error(err);
        setError("Có lỗi xảy ra khi tải dữ liệu banner.");
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
        headers: { "Content-Type": "multipart/form-data" },
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

  // --- NÚT QUAY LẠI ---
  const handleGoBack = () => navigate(-1); // Quay lại trang trước đó

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle
          className="animate-spin text-blue-500 dark:text-blue-400"
          size={48}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Chỉnh sửa banner
          </h1>
        </div>
        {banner && (
          <span className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
            ID: #{banner.id}
          </span>
        )}
      </div>

      {error && !banner && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-900 dark:border-red-700 dark:text-red-300"
          role="alert"
        >
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
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
        !isFetching && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Không có dữ liệu để hiển thị.
          </p>
        )
      )}

      {error && banner && (
        <div
          className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-900 dark:border-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
