import { useEffect, useState } from "react";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import { useAuth } from "@contexts/AuthContext";
import { Copy, X } from "lucide-react";

export default function AffiliateHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { pop } = useNotification();
  const { user } = useAuth();
  const [showAffiliate, setShowAffiliate] = useState(false);
  const URL_FE = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
  const affiliateLink = `${URL_FE}/auth/register?aff=${user?.id || ""}`;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      pop("Đã copy link liên kết thành công!", "s");
    } catch {
      pop("Copy thất bại, hãy thử lại!", "e");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/user/getHistoryAff");
        if (res.data && Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          setData([]);
        }
      } catch {
        setError("Không thể tải lịch sử tiếp thị!");
        pop("Không thể tải lịch sử tiếp thị!", "e");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg">
      <h1 className="font-heading text-2xl font-bold mb-6 text-primary">Lịch sử tiếp thị liên kết</h1>
      <button
        className="mb-4 px-4 py-2 bg-accent text-primary rounded hover:bg-accent/80 text-sm font-semibold flex items-center gap-2"
        onClick={() => setShowAffiliate(true)}
      >
        <Copy className="h-4 w-4" />
        Hiển thị link tiếp thị liên kết
      </button>
      {showAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-gradient-header rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAffiliate(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 text-primary">Link tiếp thị liên kết của bạn</h3>
            <div className="flex items-center gap-2 border rounded-lg p-2">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-accent text-primary rounded hover:bg-accent/80 text-xs font-semibold"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-secondary mt-2">Gửi link này cho bạn bè, khi họ đăng ký bạn sẽ nhận được hoa hồng!</p>
          </div>
        </div>
      )}
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : data.length === 0 ? (
        <div>Chưa có lịch sử tiếp thị nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="text-primary">
                <th className="px-4 py-2 border">STT</th>
                <th className="px-4 py-2 border">Mã đơn hàng</th>
                <th className="px-4 py-2 border">Hoa hồng (VNĐ)</th>
                <th className="px-4 py-2 border">Ngày nhận</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.order_id + idx} className="text-center">
                  <td className="px-4 py-2 border">{idx + 1}</td>
                  <td className="px-4 py-2 border">{item.order_id}</td>
                  <td className="px-4 py-2 border font-semibold text-primary">{item.commission_amount.toLocaleString("vi-VN")} đ</td>
                  <td className="px-4 py-2 border">{new Date(item.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
} 