import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../utils/http";
import LoadingDomain from "@components/Loading/LoadingDomain";

export default function ShowOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/admin/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <LoadingDomain />;
  if (!order) return <div className="text-center p-6">Không tìm thấy đơn hàng.</div>;

  const { items, user, wallet_transaction: wallet, ...orderInfo } = order;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-sm-600 hover:text-sm-900"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-sm-900">Chi tiết đơn hàng #{orderInfo.order_code}</h1>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border transition-all bg-orange-400/10 border-orange-400/30">
          <p className="text-sm text-yellow-700">Tổng tiền</p>
          <p className="text-2xl font-bold text-yellow-800">{orderInfo.total_amount}đ</p>
        </div>
        <div className="p-4 rounded-lg border transition-all bg-green-400/10 border-green-400/30">
          <p className="text-sm text-red-700">Khuyến mãi</p>
          <p className="text-2xl font-bold text-red-800">
            {orderInfo.discount_amount || 0}đ
          </p>
        </div>
        <div className="p-4 rounded-lg border transition-all bg-gray-400/10 border-gray-400/30">
          <p className="text-sm text-blue-700">Ngày đặt</p>
          <p className="text-2xl font-bold text-blue-800">
            {new Date(orderInfo.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Thông tin người mua */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-2 rounded-lg border transition-all border-themed/50 shadow p-6 space-y-2">
          <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="grid sm:grid-cols-2 gap-y-3 text-sm text-sm-700">
            <div><span className="font-medium text-sm-500">Mã đơn hàng:</span> {orderInfo.order_code}</div>
            <div><span className="font-medium text-sm-500">Trạng thái:</span>{" "}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${orderInfo.status === 1 ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100"}`}>
                {orderInfo.status === 1 ? "Hoàn tất" : "Đang xử lý"}
              </span>
            </div>
            <div><span className="font-medium text-sm-500">Khuyến mãi áp dụng:</span> {orderInfo.promo_code || "Không có"}</div>
            <div><span className="font-medium text-sm-500">Loại giao dịch:</span> {wallet?.type || "Không rõ"}</div>
          </div>
        </div>

        {/* Người mua */}
        <div className="rounded-lg border shadow transition-all border-themed/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Người mua</h2>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user.avatar_url}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-sm-500">ID: {user.id}</p>
            </div>
          </div>
          <div className="text-sm space-y-1 text-sm-700">
            <p className="text-sm font-medium">Email: {user.email}</p>
            <p className="text-sm font-medium">SĐT: {user.phone || "Chưa có"}</p>
            <p>Trạng thái:{" "}
              {user.status === 1 ? (
                <span className="text-green-600 font-medium">Hoạt động</span>
              ) : (
                <span className="text-red-600 font-medium">Ngưng</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Sản phẩm trong đơn */}
      <div className="rounded-lg border shadow transition-all border-themed/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="rounded-lg border transition-all border-themed/50 shadow text-sm">
              <tr>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Giá nhập</th>
                <th className="px-4 py-2">Giá bán</th>
                <th className="px-4 py-2">Thuộc tính</th>
              </tr>
            </thead>
            {/* flex items-center justify-between p-3 rounded-lg border transition-all border-themed/50 */}
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2 text-sm-500">{item.product.sku}</td>
                  <td className="px-4 py-2 text-sm-500">{item.unit_price}đ</td>
                  <td className="px-4 py-2 text-sm-500">{item.product.price}đ</td>
                  <td className="px-4 py-2 text-sm-500">
                    <ul className="list-disc pl-4 text-sm-500">
                      {item.product.game_attributes?.map((attr) => (
                        <li key={attr.id}>
                          <strong>{attr.attribute_key}:</strong> {attr.attribute_value}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
