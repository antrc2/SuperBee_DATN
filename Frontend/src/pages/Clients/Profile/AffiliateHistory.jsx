import { useEffect, useState } from "react";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";

export default function AffiliateHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { pop } = useNotification();

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
      } catch (err) {
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
              <tr className="bg-gray-100">
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
                  <td className="px-4 py-2 border font-semibold text-green-600">{item.commission_amount.toLocaleString("vi-VN")} đ</td>
                  <td className="px-4 py-2 border">{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
} 