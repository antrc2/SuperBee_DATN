import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LoaderCircle, ArrowLeft, Edit } from "lucide-react";
import api from "../../../utils/http";

const DetailItem = ({ label, value, className = "" }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd
      className={`mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ${className}`}
    >
      {value}
    </dd>
  </div>
);

export default function BannerDetailPage() {
  const { id } = useParams();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await api.get(`/admin/banners/${id}`);
        setBanner(response.data.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải chi tiết banner.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
        <p>{error || "Không tìm thấy banner."}</p>
        <Link
          to="/admin/banners"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/admin/banners"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
        <Link
          to={`/admin/banners/${banner.id}/edit`}
          className="flex items-center gap-2 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
        >
          <Edit size={18} />
          Chỉnh sửa
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Chi tiết banner #{banner.id}
      </h1>

      <div className="border-t border-gray-200">
        <dl>
          <DetailItem label="Tiêu đề" value={banner.title || "Không có"} />
          <DetailItem
            label="Liên kết"
            value={
              banner.link ? (
                <a
                  href={banner.link}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {banner.link}
                </a>
              ) : (
                "Không có"
              )
            }
          />
          <DetailItem label="Alt text" value={banner.alt_text || "Không có"} />
          <DetailItem
            label="Trạng thái"
            value={
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  banner.status === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {banner.status === 1 ? "Đang hiển thị" : "Ẩn"}
              </span>
            }
          />
          <DetailItem
            label="Hình ảnh"
            value={
              <img
                src={`${import.meta.env.VITE_BACKEND_IMG}${banner.image_url}`}
                alt={banner.alt_text || "Banner"}
                className="w-full max-w-xs h-auto border rounded-md mt-2"
              />
            }
          />
        </dl>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
          Thông tin hệ thống
        </h3>
        <dl>
          <DetailItem
            label="Người tạo"
            value={banner?.creator?.username || banner.created_by || "Không rõ"}
          />
          <DetailItem
            label="Người cập nhật"
            value={banner?.updater?.username || banner.updated_by || "Không rõ"}
          />
          <DetailItem
            label="Ngày tạo"
            value={new Date(banner.created_at).toLocaleString("vi-VN")}
          />
          <DetailItem
            label="Ngày cập nhật"
            value={new Date(banner.updated_at).toLocaleString("vi-VN")}
          />
        </dl>
      </div>
    </div>
  );
}
