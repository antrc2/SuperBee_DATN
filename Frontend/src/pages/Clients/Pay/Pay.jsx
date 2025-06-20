import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Tag,
  X,
  CreditCard,
  ShieldCheck,
  Gift
} from "lucide-react";
import { useCart } from "@contexts/CartContexts";
import { useNotification } from "@contexts/NotificationProvider";
import { Link } from "react-router-dom";
import LoadingDomain from "@components/Loading/LoadingDomain";
import api from "@utils/http";

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  const numberAmount = Number(amount);
  if (isNaN(numberAmount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(numberAmount);
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
                    <p className="font-bold text-blue-600 text-lg">{discount.code}</p>
                    <p className="text-sm text-gray-700">
                      {discount.description || `Giảm ${discount.value}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Hạn sử dụng: {discount.expiry}
                      {discount.min_discount_amount > 0 &&
                        ` | Đơn tối thiểu: ${formatCurrency(discount.min_discount_amount)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyDiscount(discount.code);
                      onClose();
                    }}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
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
  const { pop, conFim } = useNotification();
  const { fetchCartItems, cartItems, loadingCart } = useCart();
  const [cartItemsPay, setCartItemsPay] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [promotionCodes, setPromotionCodes] = useState([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Lấy dữ liệu từ API /orders/checkout
  useEffect(() => {
    const fetchCheckoutData = async () => {
      setCartError(null);
      try {
        // Đồng bộ giỏ hàng từ context
        await fetchCartItems();
        const response = await api.get("/orders/checkout");
        if (response.data?.status) {
          const items = response.data.carts
            .filter((item) => item.status === 1) // Chỉ lấy sản phẩm có status = 1
            .map((item) => ({
              id: item.id, // cart_item_id
              product_id: item.product_id,
              name: item.product?.sku || "Sản phẩm không tên",
              image:
                item.product?.images?.[0]?.image_url ||
                "https://placehold.co/100x100/E2E8F0/4A5568?text=Sản+phẩm",
              price: parseFloat(item.unit_price) || 0,
              old_price: parseFloat(item.product?.price) || 0,
              quantity: 1 // Giả định số lượng
            }));
          setCartItemsPay(items);
          setUserBalance(parseFloat(response.data.balance) || 0);
          setPromotionCodes(
            response.data.promotion_codes.map((promo) => ({
              id: promo.id,
              code: promo.code,
              description: promo.description || `Giảm ${promo.discount_value}`,
              type: "percentage",
              value: parseFloat(promo.discount_value) || 0,
              expiry: promo.end_date || "N/A",
              min_discount_amount: promo.min_discount_amount || 0
            }))
          );
          if (items.length === 0) {
            pop("Giỏ hàng của bạn đang trống.", "i");
          }
        } else {
          pop(response.data.message, "e");
          setCartError({ message: response.data.message });
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu giỏ hàng:", error);
        const errorMessage =
          error.response?.data?.message || "Lỗi khi tải dữ liệu giỏ hàng.";
        pop(errorMessage, "e");
        setCartError({ message: errorMessage });
      }
    };

    fetchCheckoutData();
  }, [fetchCartItems, pop]);

  // Tính toán tổng tiền
  const { subtotal, discountAmount, finalAmount } = useMemo(() => {
    const subtotal = cartItemsPay.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = appliedDiscount?.discount_amount || 0;
    const finalAmount = Math.max(subtotal - discountAmount, 0);
    return { subtotal, discountAmount, finalAmount };
  }, [cartItemsPay, appliedDiscount]);

  // Kiểm tra và áp dụng mã giảm giá
  const handleApplyDiscountCode = async (codeToApply = discountCodeInput) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      pop("Vui lòng nhập mã giảm giá.", "e");
      return;
    }

    if (!(await conFim(`Bạn muốn áp dụng mã giảm giá "${code}"?`))) return;

    try {
      const response = await api.post("/orders/check", { promotion_code: code });
      if (response.data.status) {
        setAppliedDiscount({
          code: response.data.promotion_code,
          discount_amount: parseFloat(response.data.discount_amount) || 0,
          discount_value: parseFloat(response.data.discount_value) || 0,
          total_price_after_discount: parseFloat(response.data.total_price_after_discount) || 0
        });
        pop(response.data.message, "s");
        setDiscountCodeInput("");
      } else {
        setAppliedDiscount(null);
        pop(response.data.message, "e");
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra mã giảm giá:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi kiểm tra mã giảm giá.";
      pop(errorMessage, "e");
      setAppliedDiscount(null);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!(await conFim("Bạn có chắc chắn muốn xóa mã giảm giá?"))) return;
    setAppliedDiscount(null);
    pop("Đã xóa mã giảm giá.", "s");
  };

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!termsAccepted) {
      pop("Bạn cần đồng ý với điều khoản và dịch vụ.", "e");
      return;
    }

    if (finalAmount > userBalance) {
      pop("Số dư không đủ để thanh toán.", "e");
      return;
    }

    if (!(await conFim("Bạn có chắc chắn muốn thanh toán đơn hàng?"))) return;

    try {
      const response = await api.post("/orders/purchase", {
        promotion_code: appliedDiscount?.code || null
      });
      if (response.data.status) {
        setUserBalance((prev) => prev - finalAmount);
        setCartItemsPay([]);
        setAppliedDiscount(null);
        pop(response.data.message, "s");
        // Đồng bộ lại giỏ hàng
        await fetchCartItems();
      } else {
        pop(response.data.message, "e");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xử lý thanh toán.";
      pop(errorMessage, "e");
    }
  };

  // Xử lý xóa sản phẩm
  const handleRemoveItem = async (itemId, itemName) => {
    if (!(await conFim(`Bạn có chắc chắn muốn xóa "${itemName}" khỏi giỏ hàng?`))) return;

    try {
      await api.delete(`/cart/${itemId}`);
      setCartItemsPay((prevItems) => prevItems.filter((item) => item.id !== itemId));
      await fetchCartItems(); // Đồng bộ giỏ hàng
      pop("Đã xóa sản phẩm khỏi giỏ hàng.", "s");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa sản phẩm.";
      pop(errorMessage, "e");
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    setCartItemsPay((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Hiển thị loading
  if (loadingCart) return <LoadingDomain />;

  // // Hiển thị giỏ hàng rỗng
  // if (cartItemsPay.length === 0) {
  //   return (
  //     <div className="bg-gray-100 min-h-screen py-8 px-4">
  //       <div className="max-w-4xl mx-auto text-center">
  //         <ShoppingCart size={80} className="mx-auto text-gray-400 mb-6" />
  //         <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
  //         <p className="mb-8 text-gray-600">
  //           Hãy khám phá thêm sản phẩm tuyệt vời của chúng tôi!
  //         </p>
  //         <Link
  //           to="/"
  //           className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium inline-flex items-center"
  //         >
  //           <X size={20} className="mr-1" />
  //           Quay lại mua sắm
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Thanh Toán ({cartItemsPay.length} sản phẩm)
        </h1>
        <Link to="/cart" className="text-blue-600 font-medium flex items-center">
          <X size={20} className="mr-1" />
          Quay lại giỏ hàng
        </Link>
      </div>

      <div className="lg:flex gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 border-b pb-4">
            Sản phẩm trong đơn hàng
          </h2>
          {cartItemsPay.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-3"
            >
              <div className="flex items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mr-4 border"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/100x100/E2E8F0/4A5568?text=Lỗi";
                  }}
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">Mã sản phẩm: {item.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-red-600">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="text-gray-500 hover:text-red-600"
                  aria-label={`Xóa ${item.name}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt đơn hàng và thanh toán */}
        <div className="lg:w-1/3 bg-white rounded-lg shadow-md p-6 h-fit sticky top-24 mt-8 lg:mt-0">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Sản phẩm:</span>
              <span>{cartItemsPay.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({appliedDiscount.code}):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Tổng cộng:</span>
              <span className="font-bold text-red-600 text-xl">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>

          {/* Mã giảm giá */}
          <div className="mb-6">
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
                className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
              <button
                onClick={() => handleApplyDiscountCode()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
              >
                Áp dụng
              </button>
            </div>
            {appliedDiscount && (
              <button
                onClick={handleRemoveDiscount}
                className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center"
              >
                <X size={12} className="mr-1" /> Xóa mã "{appliedDiscount.code}"
              </button>
            )}
            <button
              onClick={() => setShowDiscountModal(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Gift size={16} className="mr-1" /> Xem mã giảm giá của bạn
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">Số dư tài khoản:</p>
            <span className="text-blue-600 font-bold text-xl">{formatCurrency(userBalance)}</span>
          </div>

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
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              Tôi đồng ý với{" "}
              <a href="#" className="text-blue-600 hover:underline">
                điều khoản và dịch vụ
              </a>{" "}
              của website.
            </label>
          </div>

          <button
            onClick={handlePayment}
            disabled={loadingCart || finalAmount > userBalance || !termsAccepted}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <CreditCard className="inline mr-2" />
            Thanh toán ({formatCurrency(finalAmount)})
          </button>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p className="flex items-center justify-center">
              <ShieldCheck size={14} className="mr-1 text-green-500" />
              Giao dịch an toàn.
            </p>
          </div>
        </div>
      </div>

      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        discounts={promotionCodes}
        onApplyDiscount={handleApplyDiscountCode}
      />
    </div>
  );
}