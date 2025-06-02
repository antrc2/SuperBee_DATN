import React, { useState } from "react";
import {
  ChevronLeft,
  Trash2,
  ShoppingCart,
  CreditCard,
  Tag,
  ShieldCheck,
  Info
} from "lucide-react";

// Dữ liệu giả lập cho giỏ hàng
const initialCartItemsData = [
  {
    id: "item1",
    name: "Acc Liên Quân Rank Cao Thủ VIP",
    price: 750000,
    imageUrl: "https://placehold.co/120x120/E2E8F0/4A5568?text=LQ+VIP",
    quantity: 1,
    description: "Full tướng, 300 skin, ngọc 90 đầy đủ.",
    game: "Liên Quân Mobile",
    tags: ["Rank Cao Thủ", "Nhiều Skin"]
  },
  {
    id: "item2",
    name: "Tài khoản Free Fire Full Set Đồ Hiếm",
    price: 450000,
    imageUrl: "https://placehold.co/120x120/E2E8F0/4A5568?text=FF+Hiếm",
    quantity: 1,
    description: "Sở hữu nhiều trang phục và vũ khí độc quyền, MP40 Mãng Xà.",
    game: "Free Fire",
    tags: ["Full Set", "Đồ Hiếm"]
  },
  {
    id: "item3",
    name: "Account Blox Fruits Max Level + Godhuman",
    price: 1200000,
    imageUrl: "https://placehold.co/120x120/E2E8F0/4A5568?text=BloxMax",
    quantity: 1,
    description:
      "Đã max level, full skill, trái ác quỷ xịn, sẵn sàng chinh chiến.",
    game: "Blox Fruits",
    tags: ["Max Level", "Godhuman"]
  },
  {
    id: "item4",
    name: "Nick Valorant Full Đặc Vụ, Skin Phantom",
    price: 900000,
    imageUrl: "https://placehold.co/120x120/E2E8F0/4A5568?text=ValoFS",
    quantity: 1,
    description: "Mở khóa tất cả đặc vụ, skin Phantom Quang Phổ.",
    game: "Valorant",
    tags: ["Full Đặc Vụ", "Skin Phantom"]
  }
];

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};

// Component CartPage
export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItemsData);
  const [selectedItems, setSelectedItems] = useState(
    initialCartItemsData.reduce((acc, item) => {
      acc[item.id] = true; // Mặc định chọn tất cả
      return acc;
    }, {})
  );

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      delete newSelected[itemId];
      return newSelected;
    });
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelectedItems = {};
    cartItems.forEach((item) => {
      newSelectedItems[item.id] = isChecked;
    });
    setSelectedItems(newSelectedItems);
  };

  const isAllSelected =
    cartItems.length > 0 && cartItems.every((item) => selectedItems[item.id]);

  const itemsToCheckout = cartItems.filter((item) => selectedItems[item.id]);
  const totalSelectedCount = itemsToCheckout.length;
  const subtotalPrice = itemsToCheckout.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 0; // Giả sử miễn phí vận chuyển cho tài khoản game
  const totalPrice = subtotalPrice + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart size={80} className="mx-auto text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-gray-600 mb-8">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các
            tài khoản game tuyệt vời của chúng tôi!
          </p>
          <a
            href="/" // Thay bằng link trang chủ hoặc trang sản phẩm
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft size={20} className="mr-2 -ml-1" />
            Quay lại mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-12 max-w-7xl mx-auto">
      <div className="container mx-auto px-4">
        {/* Header Giỏ Hàng */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Giỏ hàng của bạn ({cartItems.length} sản phẩm)
          </h1>
          <a
            href="/" // Thay bằng link trang chủ hoặc trang sản phẩm
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Tiếp tục mua sắm
          </a>
        </div>

        {/* Layout chính: Danh sách sản phẩm và Tóm tắt đơn hàng */}
        <div className="lg:flex lg:gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header của danh sách sản phẩm */}
              <div className="hidden sm:flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="w-1/2 flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </label>
                </div>
                <div className="w-1/4 text-center text-sm font-medium text-gray-500">
                  Đơn giá
                </div>
                <div className="w-1/4 text-right text-sm font-medium text-gray-500">
                  Thao tác
                </div>
              </div>

              {/* Các sản phẩm trong giỏ */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-b last:border-b-0 flex flex-col sm:flex-row items-start sm:items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox và Ảnh (Mobile + Desktop) */}
                  <div className="flex items-center w-full sm:w-1/2 mb-3 sm:mb-0">
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4 shrink-0"
                      checked={!!selectedItems[item.id]}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-200 mr-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/100x100/E2E8F0/4A5568?text=Lỗi";
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                        <a href="#">{item.name}</a>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {item.game}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 hidden md:block truncate">
                        {item.description}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.tags &&
                          item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Đơn giá (Desktop) */}
                  <div className="hidden sm:block sm:w-1/4 text-center">
                    <p className="text-sm sm:text-base font-medium text-red-600">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Đơn giá (Mobile) - Hiển thị dưới tên sản phẩm */}
                  <p className="sm:hidden text-base font-medium text-red-600 mb-2 ml-[calc(1.25rem+4px+1rem)] sm:ml-0">
                    {" "}
                    {/* 1.25rem (checkbox width) + 4px (mr) + 1rem (img mr) */}
                    {formatCurrency(item.price)}
                  </p>

                  {/* Thao tác (Mobile + Desktop) */}
                  <div className="w-full sm:w-1/4 flex sm:justify-end items-center mt-2 sm:mt-0 ml-[calc(1.25rem+4px)] sm:ml-0">
                    {" "}
                    {/* Align with checkbox on mobile */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                      aria-label="Xóa sản phẩm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              {" "}
              {/* sticky top for desktop */}
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">
                Tóm tắt đơn hàng
              </h2>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Số lượng sản phẩm đã chọn:
                  </span>
                  <span className="font-medium text-gray-800">
                    {totalSelectedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(subtotalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí bảo hiểm/giao dịch:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-800">
                    Tổng cộng:
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
              <button
                disabled={totalSelectedCount === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 flex items-center justify-center"
              >
                <CreditCard size={20} className="mr-2" />
                Tiến hành thanh toán ({totalSelectedCount})
              </button>
              <div className="mt-6 text-xs text-gray-500 text-center">
                <p className="flex items-center justify-center">
                  <ShieldCheck size={14} className="mr-1 text-green-500" />
                  Giao dịch an toàn và bảo mật.
                </p>
                <p className="mt-1">
                  Mọi thông tin tài khoản sẽ được chuyển giao ngay sau khi thanh
                  toán thành công.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
