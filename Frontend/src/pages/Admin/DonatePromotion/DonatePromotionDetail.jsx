import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../utils/http";
import LoadingDomain from "@components/Loading/LoadingDomain";

export default function DonatePromotionDetailPage() {
  const { id } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await api.get(`/admin/donate_promotions/${id}`);
        setPromotion(res.data.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải chi tiết khuyến mãi.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [id]);

  if (loading) return <LoadingDomain />;
  if (error || !promotion) {
    return (
      <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
        <p>{error || "Không tìm thấy dữ liệu khuyến mãi."}</p>
        <Link to="/admin/donatePromotions" className="mt-4 inline-block text-blue-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const { creator, web } = promotion;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          to="/admin/donatePromotions"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        Thông tin khuyến mãi #{promotion.id}
      </h1>

      {/* Thông tin số liệu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border transition-all bg-green-400/10 border-green-400/30 shadow">
          <p className="text-sm text-red-700">Mức giảm</p>
          <p className="text-2xl font-bold text-red-800">{promotion.amount}%</p>
        </div>
        <div className="p-4 rounded-lg border transition-all bg-orange-400/10 border-orange-400/30 shadow">
          <p className="text-sm text-yellow-700">Đã sử dụng</p>
          <p className="text-2xl font-bold text-yellow-800">{promotion.total_used} lượt</p>
        </div>
        <div className="p-4 rounded-lg border transition-all bg-gray-400/10 border-gray-400/30 shadow">
          <p className="text-sm text-blue-700">Giới hạn mỗi người</p>
          <p className="text-2xl font-bold text-blue-800">
            {promotion.per_user_limit === -1 ? "Không giới hạn" : promotion.per_user_limit}
          </p>
        </div>
      </div>

      {/* Grid chính */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Thông tin khuyến mãi */}
        <div className="col-span-2 rounded-lg border shadow transition-all border-themed/50 p-6 shadow p-6 space-y-2">
          <h2 className="text-xl font-semibold mb-4">Thông tin mã khuyến mãi</h2>
          <div className="grid sm:grid-cols-2 gap-y-3 text-sm">
            <div><span className="font-medium text-sm-500">Mã khuyến mãi:</span> {creator.donate_code}</div>
            <div><span className="font-medium text-sm-500">Trạng thái:</span> 
              {promotion.status === 1 ? (
                <span className="ml-1 px-2 py-0.5 rounded-full text-green-800 bg-green-100 text-xs font-medium">Hoạt động</span>
              ) : (
                <span className="ml-1 px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">Tạm tắt</span>
              )}
            </div>
            <div><span className="font-medium text-sm-500">Thời gian bắt đầu:</span> {new Date(promotion.start_date).toLocaleString("vi-VN")}</div>
            <div><span className="font-medium text-sm-500">Thời gian kết thúc:</span> {new Date(promotion.end_date).toLocaleString("vi-VN")}</div>
            <div><span className="font-medium text-sm-500">Giới hạn tổng:</span> {promotion.usage_limit === -1 ? "Không giới hạn" : promotion.usage_limit}</div>
            <div><span className="font-medium text-sm-500">Ngày tạo:</span> {new Date(promotion.created_at).toLocaleString("vi-VN")}</div>
            <div><span className="font-medium text-sm-500">Ngày cập nhật:</span> {new Date(promotion.updated_at).toLocaleString("vi-VN")}</div>
          </div>
        </div>

        {/* Người tạo */}
        <div className="rounded-lg border shadow transition-all border-themed/50 shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Người tạo</h2>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={creator.avatar_url}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">{creator.username}</p>
              <p className="text-xs text-sm-500">ID: {creator.id}</p>
            </div>
          </div>
          <div className="text-sm space-y-1 text-xl-700">
            <p>Email: {creator.email}</p>
            <p>SĐT: {creator.phone || "Chưa có"}</p>
            <p>Trạng thái: 
              {creator.status === 1 ? (
                <span className="ml-1 text-green-600 font-medium">Hoạt động</span>
              ) : (
                <span className="ml-1 text-red-600 font-medium">Ngưng</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin website */}
      {web && (
        <div className="rounded-lg border shadow transition-all border-themed/50 shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin website</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-xl-700">
            <div><span className="font-medium text-sm-500">Subdomain:</span> {web.subdomain}</div>
            <div><span className="font-medium text-sm-500">API Key:</span> <span className="font-mono">{web.api_key.slice(0, 8)}...</span></div>
            <div><span className="font-medium text-sm-500">Trạng thái:</span> 
              {web.status === 1 ? (
                <span className="ml-1 text-green-600 font-medium">Hoạt động</span>
              ) : (
                <span className="ml-1 text-red-600 font-medium">Tạm tắt</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
