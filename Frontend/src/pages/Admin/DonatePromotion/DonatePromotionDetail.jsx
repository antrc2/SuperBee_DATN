// DonatePromotionDetail.jsx (Phiên bản Dark Mode đơn giản)
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Gift, Users, Lock } from "lucide-react";
import api from "../../../utils/http";
import LoadingDomain from "@components/Loading/LoadingDomain";

// Component Card để tái sử dụng, nay dùng màu trực tiếp
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold tracking-tight ${className}`}>
    {children}
  </h2>
);

export default function DonatePromotionDetailPage() {
  const { id } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Logic không đổi
    const fetchPromotion = async () => {
      try {
        const res = await api.get(`/admin/donate_promotions/${id}`);
        setPromotion(res.data.data);
      } catch (err) {
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
      <div className="text-center bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
        <p>{error || "Không tìm thấy dữ liệu khuyến mãi."}</p>
        <Link
          to="/admin/donatePromotions"
          className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const { creator, web } = promotion;

  const InfoRow = ({ label, value, children }) => (
    <div>
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900 dark:text-slate-50">
        {children || value}
      </dd>
    </div>
  );

  const StatusBadge = ({ active }) =>
    active ? (
      <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        Hoạt động
      </span>
    ) : (
      <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
        Tạm tắt
      </span>
    );

  return (
    <div className="space-y-6">
      <Link
        to="/admin/donatePromotions"
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={20} />
        Quay lại danh sách
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Chi tiết khuyến mãi:{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {creator.donate_code}
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Mức giảm</h3>
            <Gift className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {promotion.amount}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Đã sử dụng</h3>
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotion.total_used} lượt
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Giới hạn mỗi người</h3>
            <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotion.per_user_limit === -1
                ? "Vô hạn"
                : `${promotion.per_user_limit} lần`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Mã khuyến mãi" value={creator.donate_code} />
              <InfoRow label="Trạng thái">
                <StatusBadge active={promotion.status === 1} />
              </InfoRow>
              <InfoRow
                label="Bắt đầu"
                value={new Date(promotion.start_date).toLocaleString("vi-VN")}
              />
              <InfoRow
                label="Kết thúc"
                value={new Date(promotion.end_date).toLocaleString("vi-VN")}
              />
              <InfoRow
                label="Giới hạn tổng"
                value={
                  promotion.usage_limit === -1
                    ? "Không giới hạn"
                    : `${promotion.usage_limit} lượt`
                }
              />
              <InfoRow
                label="Ngày tạo"
                value={new Date(promotion.created_at).toLocaleString("vi-VN")}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Người tạo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={creator.avatar_url}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="font-semibold">{creator.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ID: {creator.id}
                </p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <InfoRow label="Email" value={creator.email} />
              <InfoRow label="SĐT" value={creator.phone || "Chưa có"} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
