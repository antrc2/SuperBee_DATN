import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Tag,
  X,
  CreditCard,
  Info,
  ChevronDown,
  ChevronUp,
  Gift
} from "lucide-react";

// Dữ liệu giả lập
const initialCartItems = [
  {
    id: "acc1",
    name: "Tài khoản VIP Pro Max",
    image: "https://placehold.co/100x100/2d3748/edf2f7?text=Acc+1",
    oldPrice: 1500000,
    newPrice: 1200000,
    server: "Máy chủ Rồng Lửa",
    level: 80,
    assets: ["Skin Giới Hạn X", "Pet Hiếm Y", "1M Vàng"],
    platform: "PC & Mobile",
    quantity: 1
  },
  {
    id: "acc2",
    name: "Acc Tân Thủ Siêu Cấp",
    image: "https://placehold.co/100x100/4a5568/e2e8f0?text=Acc+2",
    oldPrice: 500000,
    newPrice: 400000,
    server: "Máy chủ Gió Cuốn",
    level: 50,
    assets: ["Trang bị Khởi Đầu", "500K Vàng"],
    platform: "Mobile",
    quantity: 1
  }
];

const initialUserBalance = 2000000; // Số dư tài khoản người dùng

const userAvailableDiscounts = [
  {
    id: "dc1",
    code: "GIAM10",
    description: "Giảm 10% cho tổng đơn hàng",
    type: "percentage",
    value: 10,
    expiry: "31/12/2025",
    minSpend: 500000
  },
  {
    id: "dc2",
    code: "FREESHIP50K",
    description: "Giảm 50,000 VNĐ cho đơn hàng từ 1,000,000 VNĐ",
    type: "fixed",
    value: 50000,
    expiry: "30/11/2025",
    minSpend: 1000000
  },
  {
    id: "dc3",
    code: "WELCOME20",
    description: "Giảm 20% cho người mới (đơn tối thiểu 200k)",
    type: "percentage",
    value: 20,
    expiry: "N/A",
    minSpend: 200000
  }
];

// Component hiển thị thông báo
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";
  const borderColor =
    type === "success"
      ? "border-green-700"
      : type === "error"
      ? "border-red-700"
      : "border-blue-700";

  return (
    <div
      className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${bgColor} border-l-4 ${borderColor} z-50 flex items-center justify-between`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <X size={20} />
      </button>
    </div>
  );
};

// Component Modal hiển thị mã giảm giá
const DiscountModal = ({ isOpen, onClose, discounts, onApplyDiscount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Mã Giảm Giá Của Bạn
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        {discounts.length === 0 ? (
          <p className="text-gray-600">Bạn không có mã giảm giá nào.</p>
        ) : (
          <ul className="space-y-3">
            {discounts.map((discount) => (
              <li
                key={discount.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-indigo-600 text-lg">
                      {discount.code}
                    </p>
                    <p className="text-sm text-gray-700">
                      {discount.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Hạn sử dụng: {discount.expiry}
                      {discount.minSpend > 0 &&
                        ` | Đơn tối thiểu: ${discount.minSpend.toLocaleString(
                          "vi-VN"
                        )} VNĐ`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyDiscount(discount.code);
                      onClose();
                    }}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Dùng ngay
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Component chính của trang thanh toán
export default function Pay() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [userBalance, setUserBalance] = useState(initialUserBalance);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [expandedItems, setExpandedItems] = useState({});

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.newPrice * item.quantity,
      0
    );
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (
      subtotal < (appliedDiscount.minSpend || 0) &&
      appliedDiscount.code !== "WELCOME20"
    ) {
      // WELCOME20 là ví dụ mã không cần check lại minSpend ở đây vì đã check lúc apply
      return 0; // Không áp dụng nếu không đạt giá trị tối thiểu
    }
    if (appliedDiscount.type === "percentage") {
      return (subtotal * appliedDiscount.value) / 100;
    }
    return appliedDiscount.value;
  }, [appliedDiscount, subtotal]);

  const finalAmount = useMemo(() => {
    const amountAfterDiscount = subtotal - discountAmount;
    return amountAfterDiscount < 0 ? 0 : amountAfterDiscount;
  }, [subtotal, discountAmount]);

  const handleApplyDiscountCode = (codeToApply = discountCodeInput) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setMessage({ text: "Vui lòng nhập mã giảm giá.", type: "error" });
      return;
    }

    const availableCode = userAvailableDiscounts.find((d) => d.code === code);

    if (availableCode) {
      if (availableCode.minSpend && subtotal < availableCode.minSpend) {
        setMessage({
          text: `Mã ${code} yêu cầu đơn hàng tối thiểu ${availableCode.minSpend.toLocaleString(
            "vi-VN"
          )} VNĐ.`,
          type: "error"
        });
        setAppliedDiscount(null);
        return;
      }
      setAppliedDiscount(availableCode);
      setMessage({ text: `Đã áp dụng mã giảm giá ${code}!`, type: "success" });
      setDiscountCodeInput(""); // Xóa input sau khi áp dụng
    } else {
      setMessage({
        text: "Mã giảm giá không hợp lệ hoặc đã hết hạn.",
        type: "error"
      });
      setAppliedDiscount(null);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setMessage({ text: "Đã xóa mã giảm giá.", type: "info" });
  };

  const handlePayment = () => {
    if (!termsAccepted) {
      setMessage({
        text: "Bạn cần đồng ý với điều khoản và dịch vụ.",
        type: "error"
      });
      return;
    }
    if (finalAmount > userBalance) {
      setMessage({
        text: "Số dư không đủ để thanh toán. Vui lòng nạp thêm.",
        type: "error"
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "Đang xử lý thanh toán...", type: "info" });

    // Giả lập gọi API
    setTimeout(() => {
      setUserBalance((prevBalance) => prevBalance - finalAmount);
      setCartItems([]); // Xóa giỏ hàng sau khi thanh toán thành công
      setAppliedDiscount(null);
      setIsLoading(false);
      setMessage({
        text: "Thanh toán thành công! Cảm ơn bạn đã mua hàng.",
        type: "success"
      });
      // Chuyển hướng hoặc cập nhật UI khác ở đây
    }, 2000);
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    setMessage({ text: "Đã xóa sản phẩm khỏi giỏ hàng.", type: "info" });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1; // Số lượng tối thiểu là 1
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Kiểm tra lại mã giảm giá nếu giỏ hàng thay đổi
  useEffect(() => {
    if (
      appliedDiscount &&
      appliedDiscount.minSpend &&
      subtotal < appliedDiscount.minSpend
    ) {
      setAppliedDiscount(null);
      setMessage({
        text: `Mã giảm giá ${appliedDiscount.code} không còn hợp lệ do tổng tiền thay đổi.`,
        type: "warning"
      });
    }
  }, [subtotal, appliedDiscount]);

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <MessageBox
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />
      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        discounts={userAvailableDiscounts}
        onApplyDiscount={(code) => {
          handleApplyDiscountCode(code);
        }}
      />

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center">
            <ShoppingCart size={40} className="mr-3 text-indigo-600" />
            Thanh Toán Đơn Hàng
          </h1>
        </header>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <ShoppingCart size={60} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Giỏ hàng của bạn đang trống!
            </h2>
            <p className="text-gray-500 mb-6">
              Hãy lựa chọn những tài khoản game tuyệt vời và quay lại nhé.
            </p>
            <a
              href="#"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <section className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                Sản phẩm trong giỏ ({cartItems.length})
              </h2>
              <ul className="space-y-6">
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-md object-cover border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/100x100/ccc/999?text=Lỗi+Ảnh";
                        }}
                      />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-indigo-700">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-red-500 font-bold text-xl">
                            {(item.newPrice * item.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </p>
                          {item.oldPrice > item.newPrice && (
                            <p className="text-gray-500 line-through text-sm">
                              {(item.oldPrice * item.quantity).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </p>
                          )}
                        </div>
                        <div className="flex items-center mt-2">
                          <label
                            htmlFor={`quantity-${item.id}`}
                            className="text-sm text-gray-600 mr-2"
                          >
                            Số lượng:
                          </label>
                          <input
                            type="number"
                            id={`quantity-${item.id}`}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 border border-gray-300 rounded-md p-1 text-center"
                            min="1"
                          />
                        </div>
                        <button
                          onClick={() => toggleItemExpansion(item.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 flex items-center"
                        >
                          {expandedItems[item.id]
                            ? "Ẩn chi tiết"
                            : "Xem chi tiết"}
                          {expandedItems[item.id] ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors self-start sm:self-center"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    {expandedItems[item.id] && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Máy chủ:</strong> {item.server}
                        </p>
                        <p>
                          <strong>Cấp độ:</strong> {item.level}
                        </p>
                        <p>
                          <strong>Nền tảng:</strong> {item.platform}
                        </p>
                        <p>
                          <strong>Tài sản nổi bật:</strong>{" "}
                          {item.assets.join(", ")}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Tóm tắt đơn hàng và Thanh toán */}
            <section className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                  Tóm Tắt Đơn Hàng
                </h2>

                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="font-medium">
                      {subtotal.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedDiscount.code}):</span>
                      <span className="font-medium">
                        - {discountAmount.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t">
                    <span>Tổng cộng:</span>
                    <span>{finalAmount.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>

                {/* Mã giảm giá */}
                <div className="mt-6">
                  <label
                    htmlFor="discountCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mã giảm giá
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="discountCode"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value)}
                      placeholder="Nhập mã của bạn"
                      className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                    />
                    <button
                      onClick={() => handleApplyDiscountCode()}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {appliedDiscount && (
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center"
                    >
                      <X size={12} className="mr-1" /> Xóa mã "
                      {appliedDiscount.code}"
                    </button>
                  )}
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Gift size={16} className="mr-1" /> Xem mã giảm giá của bạn
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">
                  Thanh Toán
                </h2>
                <div className="mb-4">
                  <p className="text-gray-700">Số dư tài khoản của bạn:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userBalance.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>

                {finalAmount > userBalance && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">
                    <p className="font-semibold flex items-center">
                      <Info size={16} className="mr-2" />
                      Số dư không đủ!
                    </p>
                    <p>
                      Vui lòng{" "}
                      <a
                        href="#"
                        className="font-medium underline hover:text-red-800"
                      >
                        nạp thêm tiền
                      </a>{" "}
                      để hoàn tất thanh toán.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="terms"
                    className="flex items-center text-sm text-gray-600"
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                    />
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      điều khoản và dịch vụ
                    </a>{" "}
                    của website.
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={
                    isLoading ||
                    finalAmount > userBalance ||
                    !termsAccepted ||
                    cartItems.length === 0
                  }
                  className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center
                              hover:bg-indigo-700 transition-colors
                              disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <CreditCard size={20} className="mr-2" />
                  )}
                  {isLoading
                    ? "Đang xử lý..."
                    : `Thanh toán ${finalAmount.toLocaleString("vi-VN")} VNĐ`}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
