import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Trash2,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import api from "@utils/http";

// Hàm định dạng tiền tệ an toàn
const formatCurrency = (amount) => {
  const numberAmount = Number(amount);
  if (isNaN(numberAmount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numberAmount);
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get("/carts");
      const rawItems = res.data?.data?.items ?? [];

      // Chuẩn hóa dữ liệu từ API
      const items = rawItems.map((item) => ({
        id: item.id,
        name: item.product?.name ?? "Không có tên",
        description: item.product?.description ?? "",
        imageUrl: item.product?.image_url ?? "",
        price: Number(item.product?.price ?? 0),
        quantity: 1, // Giả sử BE của bạn chưa có quantity thì default về 1
      }));

      setCartItems(items);

      // Mặc định tất cả sản phẩm được chọn
      const defaultSelected = items.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {});
      setSelectedItems(defaultSelected);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelectedItems = {};
    cartItems.forEach((item) => {
      newSelectedItems[item.id] = isChecked;
    });
    setSelectedItems(newSelectedItems);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Gọi API xoá giỏ hàng bên BE
      await api.delete(`/carts/${itemId}`);

      // Sau khi xoá thành công thì load lại giỏ hàng từ BE
      fetchCart();
    } catch (err) {
      console.error("Lỗi xoá sản phẩm:", err);
      alert("Xoá sản phẩm thất bại. Vui lòng thử lại!");
    }
  };

  const isAllSelected =
    cartItems.length > 0 && cartItems.every((item) => selectedItems[item.id]);

  const itemsToCheckout = cartItems.filter((item) => selectedItems[item.id]);
  const totalSelectedCount = itemsToCheckout.length;
  const subtotalPrice = itemsToCheckout.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingFee = 0;
  const totalPrice = subtotalPrice + shippingFee;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart size={80} className="mx-auto text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold mb-4">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="mb-8 text-gray-600">
            Hãy khám phá thêm sản phẩm tuyệt vời của chúng tôi!
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium"
          >
            <ChevronLeft size={20} className="inline mr-1" />
            Quay lại mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Giỏ hàng ({cartItems.length} sản phẩm)
        </h1>
        <a href="/" className="text-blue-600 font-medium">
          <ChevronLeft size={20} className="inline mr-1" /> Tiếp tục mua sắm
        </a>
      </div>

      <div className="lg:flex gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="h-5 w-5 mr-3"
            />
            <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-3"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!selectedItems[item.id]}
                  onChange={() => handleSelectItem(item.id)}
                  className="h-5 w-5 mr-3"
                />
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mr-4 border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/100x100/E2E8F0/4A5568?text=Lỗi";
                  }}
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-red-600">
                  {formatCurrency(item.price)}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:w-1/3 bg-white rounded-lg shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Sản phẩm đã chọn:</span>
              <span>{totalSelectedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí giao dịch:</span>
              <span>Miễn phí</span>
            </div>
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Tổng cộng:</span>
              <span className="font-bold text-red-600 text-xl">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
          <button
            disabled={totalSelectedCount === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            <CreditCard className="inline mr-2" /> Thanh toán (
            {totalSelectedCount})
          </button>
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p className="flex items-center justify-center">
              <ShieldCheck size={14} className="mr-1 text-green-500" />
              Giao dịch an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
