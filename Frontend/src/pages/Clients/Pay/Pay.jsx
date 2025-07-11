import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Tag,
  X,
  CreditCard,
  ShieldCheck,
  Gift,
  TicketPercent, // Added for promotion icon
} from "lucide-react";
import { useCart } from "@contexts/CartContext";
import { useNotification } from "@contexts/NotificationContext";
import { Link, useNavigate } from "react-router-dom";
import LoadingDomain from "@components/Loading/LoadingDomain";
import api from "@utils/http";
import { useAuth } from "../../../contexts/AuthContext";

const formatCurrency = (amount) => {
  const numberAmount = Number(amount);
  if (isNaN(numberAmount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numberAmount);
};

const DiscountModal = ({
  isOpen,
  onClose,
  discounts,
  onApplyDiscount,
  appliedPromotionCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center p-4 z-40">
      <div className="bg-bg-primary rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto custom-scrollbar-notification">
        {" "}
        {/* Added custom-scrollbar-notification */}
        <div className="flex justify-between items-center mb-4 border-b border-border-primary pb-3">
          <h3 className="text-2xl font-semibold text-text-primary flex items-center">
            <Gift size={24} className="mr-2 text-accent-primary" />
            Mã Giảm Giá Của Bạn
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-accent-secondary transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        {discounts.length === 0 ? (
          <p className="text-text-secondary text-center py-4">
            Bạn không có mã giảm giá nào hiện có.
          </p>
        ) : (
          <ul className="space-y-4 mt-4">
            {discounts.map((discount) => (
              <li
                key={discount.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  appliedPromotionCode === discount.code
                    ? "border-accent-primary shadow-lg scale-105"
                    : "border-border-primary hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <p className="font-bold text-xl mb-1 flex items-center">
                      <TicketPercent
                        size={20}
                        className="mr-2 text-text-secondary"
                      />
                      <span className="text-accent-primary">
                        {discount.code}
                      </span>
                      {appliedPromotionCode === discount.code && (
                        <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                          Đang áp dụng
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-text-secondary mb-2">
                      {discount.description || `Giảm ${discount.value}%`}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      <span className="font-medium">Hạn sử dụng:</span>{" "}
                      {discount.expiry === "N/A"
                        ? "Vô thời hạn"
                        : new Date(discount.expiry).toLocaleDateString("vi-VN")}
                    </p>
                    {discount.min_discount_amount > 0 && (
                      <p className="text-xs text-text-tertiary mt-1">
                        <span className="font-medium">Đơn tối thiểu:</span>{" "}
                        {formatCurrency(discount.min_discount_amount)}
                      </p>
                    )}
                    {discount.max_discount_amount > 0 && (
                      <p className="text-xs text-text-tertiary mt-1">
                        <span className="font-medium">Giảm tối đa:</span>{" "}
                        {formatCurrency(discount.max_discount_amount)}
                      </p>
                    )}
                    {discount.per_user_limit !== -1 && (
                      <p className="text-xs text-text-tertiary mt-1">
                        <span className="font-medium">Lượt dùng/người:</span>{" "}
                        {discount.per_user_limit}
                      </p>
                    )}
                    {discount.usage_limit !== -1 && (
                      <p className="text-xs text-text-tertiary mt-1">
                        <span className="font-medium">Lượt dùng tổng:</span>{" "}
                        {discount.usage_limit}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onApplyDiscount(discount.code);
                      onClose();
                    }}
                    disabled={appliedPromotionCode === discount.code}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                      appliedPromotionCode === discount.code
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-button-primary text-button-text hover:bg-button-primary-hover"
                    }`}
                  >
                    {appliedPromotionCode === discount.code
                      ? "Đã áp dụng"
                      : "Dùng ngay"}
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

export default function Pay() {
  const { pop, conFim } = useNotification();
  const { fetchCartItems } = useCart();
  const [cartItemsPay, setCartItemsPay] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [promotionCodes, setPromotionCodes] = useState([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null); // Stores applied discount details
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(true);
  const [discountErrorMessage, setDiscountErrorMessage] = useState(""); // New state for discount error

  // New state variables to store detailed price breakdown from BE
  const [backendRawTotalPrice, setBackendRawTotalPrice] = useState(0); // total_price from BE (raw cart sum)
  const [backendTotalPriceAfterDiscount, setBackendTotalPriceAfterDiscount] =
    useState(0); // total_price_after_discount from BE (final total with all discounts and tax)
  const [backendTaxAmount, setBackendTaxAmount] = useState(0); // tax_amount from BE
  const [backendTaxValue, setBackendTaxValue] = useState(0); // tax_value from BE (percentage)
  const [backendRoleDiscountAmount, setBackendRoleDiscountAmount] = useState(0); // discount_amount from BE (role-based)
  const [backendRoleDiscountValue, setBackendRoleDiscountValue] = useState(0); // discount_value from BE (role-based percentage)

  const navigate = useNavigate();
  const { fetchUserMoney } = useAuth(); // Assuming this fetches the latest user balance

  useEffect(() => {
    const fetchCheckoutData = async () => {
      setLoadingCheckout(true);
      try {
        const response = await api.get("/orders/checkout");
        if (response.data?.status) {
          const items = response.data.carts
            .filter((item) => item.status === 1)
            .map((item) => ({
              id: item.id,
              product_id: item.product_id,
              name: item.product?.sku || "Sản phẩm không tên",
              image:
                item.product?.images?.[0]?.image_url ||
                "https://placehold.co/100x100/E2E8F0/4A5568?text=Sản+phẩm",
              price: parseFloat(item.unit_price) || 0,
              old_price: parseFloat(item.product?.price) || 0,
            }));
          setCartItemsPay(items);
          setUserBalance(parseFloat(response.data.balance) || 0);

          // Set all the detailed price states directly from backend response
          setBackendRawTotalPrice(parseFloat(response.data.total_price) || 0);
          setBackendTotalPriceAfterDiscount(
            parseFloat(response.data.total_price_after_discount) || 0
          );
          setBackendTaxAmount(parseFloat(response.data.tax_amount) || 0);
          setBackendTaxValue(parseFloat(response.data.tax_value) || 0);
          setBackendRoleDiscountAmount(
            parseFloat(response.data.discount_amount) || 0
          );
          setBackendRoleDiscountValue(
            parseFloat(response.data.discount_value) || 0
          );

          setPromotionCodes(
            response.data.promotion_codes.map((promo) => ({
              id: promo.id,
              code: promo.code,
              description: promo.description,
              type: "percentage",
              value: parseFloat(promo.discount_value) || 0,
              expiry: promo.end_date || "N/A",
              min_discount_amount: parseFloat(promo.min_discount_amount) || 0,
              max_discount_amount: parseFloat(promo.max_discount_amount) || 0,
              per_user_limit: parseInt(promo.per_user_limit) || -1,
              usage_limit: parseInt(promo.usage_limit) || -1,
            }))
          );

          // Reset applied discount if cart items change or new data comes
          setAppliedDiscount(null);
          setDiscountCodeInput("");
          setDiscountErrorMessage(""); // Clear discount error on successful fetch

          if (items.length === 0) {
            pop("Giỏ hàng của bạn đang trống.", "info");
            navigate("/cart");
          }
        } else {
          pop(response.data.message, "error");
          navigate("/cart");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu giỏ hàng:", error);
        const errorMessage =
          error.response?.data?.message || "Lỗi khi tải dữ liệu giỏ hàng.";
        pop(errorMessage, "error");
        navigate("/cart");
      } finally {
        setLoadingCheckout(false);
      }
    };

    fetchCheckoutData();
  }, [fetchCartItems, pop, navigate]);

  // Recalculate based on backend values and applied promotion
  const { subtotalBeforeTax, totalWithTaxAndRoleDiscount, finalAmount } =
    useMemo(() => {
      const subtotalBeforeTaxAndRoleDiscount = backendRawTotalPrice;

      let currentTotal = backendTotalPriceAfterDiscount;

      if (appliedDiscount) {
        currentTotal = appliedDiscount.total_price_after_discount;
      }

      return {
        subtotalBeforeTax: subtotalBeforeTaxAndRoleDiscount,
        totalWithTaxAndRoleDiscount: backendTotalPriceAfterDiscount,
        finalAmount: currentTotal,
      };
    }, [backendRawTotalPrice, backendTotalPriceAfterDiscount, appliedDiscount]);

  const handleApplyDiscountCode = async (codeToApply = discountCodeInput) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setDiscountErrorMessage("Vui lòng nhập mã giảm giá."); // Set error message locally
      return;
    } else {
      setDiscountErrorMessage(""); // Clear error if input is not empty
    }

    if (!(await conFim(`Bạn muốn áp dụng mã giảm giá "${code}"?`))) return;

    try {
      const response = await api.post("/orders/check", {
        promotion_code: code,
      });
      if (response.data.status) {
        setAppliedDiscount({
          code: response.data.promotion_code,
          discount_amount: parseFloat(response.data.discount_amount) || 0,
          discount_value: parseFloat(response.data.discount_value) || 0,
          total_price_after_discount:
            parseFloat(response.data.total_price_after_discount) || 0,
        });
        setBackendTotalPriceAfterDiscount(
          parseFloat(response.data.total_price_after_discount) || 0
        );
        pop(response.data.message, "success");
        setDiscountCodeInput("");
        setDiscountErrorMessage(""); // Clear error on success
      } else {
        setAppliedDiscount(null);
        setDiscountErrorMessage(response.data.message); // Display error from backend
        // If promotion fails, revert to the original total price (with tax and role discount but no promo)
        const checkoutResponse = await api.get("/orders/checkout");
        if (checkoutResponse.data?.status) {
          setBackendTotalPriceAfterDiscount(
            parseFloat(checkoutResponse.data.total_price_after_discount) || 0
          );
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra mã giảm giá:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi kiểm tra mã giảm giá.";
      setDiscountErrorMessage(errorMessage); // Display error from API call
      setAppliedDiscount(null);
      // Revert to original total price on error
      try {
        const checkoutResponse = await api.get("/orders/checkout");
        if (checkoutResponse.data?.status) {
          setBackendTotalPriceAfterDiscount(
            parseFloat(checkoutResponse.data.total_price_after_discount) || 0
          );
        }
      } catch (e) {
        console.error("Error reverting total price:", e);
      }
    }
  };

  const handleRemoveDiscount = async () => {
    if (!appliedDiscount) return;

    if (!(await conFim("Bạn có chắc chắn muốn xóa mã giảm giá?"))) return;

    setAppliedDiscount(null);
    setDiscountCodeInput("");
    setDiscountErrorMessage(""); // Clear error when removing discount

    try {
      const response = await api.get("/orders/checkout");
      if (response.data.status) {
        setBackendTotalPriceAfterDiscount(
          parseFloat(response.data.total_price_after_discount) || 0
        );
        pop("Đã xóa mã giảm giá.", "success");
      } else {
        pop("Lỗi khi khôi phục giá gốc sau khi xóa mã giảm giá.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      pop("Lỗi khi xóa mã giảm giá.", "error");
    }
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      pop("Bạn cần đồng ý với điều khoản và dịch vụ.", "warning");
      return;
    }

    if (finalAmount > userBalance) {
      pop("Số dư không đủ để thanh toán. Vui lòng nạp thêm tiền.", "error");
      return;
    }

    if (!(await conFim("Bạn có chắc chắn muốn thanh toán đơn hàng này?")))
      return;

    try {
      const response = await api.post("/orders/purchase", {
        promotion_code: appliedDiscount?.code || null,
      });
      if (response.data.status) {
        setUserBalance((prev) => prev - finalAmount);
        setCartItemsPay([]);
        setAppliedDiscount(null);
        pop(response.data.message, "success");
        await fetchCartItems();
        await fetchUserMoney();
        navigate("/info/orders");
      } else {
        pop(response.data.message, "error");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xử lý thanh toán.";
      pop(errorMessage, "error");
    }
  };

  if (loadingCheckout) return <LoadingDomain />;

  return (
    <div className="bg-bg-secondary min-h-screen py-6 px-4 lg:px-8 text-text-primary">
      <div className="max-w-7xl mx-auto bg-bg-primary rounded-lg shadow-md overflow-hidden">
        <div className="py-6 px-4 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-text-primary flex items-center">
                <ShoppingCart size={28} className="mr-3 text-accent-primary" />
                Thanh Toán ({cartItemsPay.length} sản phẩm)
              </h1>
              <Link
                to="/cart"
                className="text-accent-primary font-medium flex items-center hover:text-accent-primary-hover transition-colors"
              >
                <X size={20} className="mr-1" />
                Quay lại giỏ hàng
              </Link>
            </div>
            <div className="bg-bg-content rounded-lg shadow-inner p-4 mb-4">
              <h2 className="text-lg font-semibold mb-3 text-text-primary border-b border-border-primary pb-2">
                Sản phẩm trong đơn hàng
              </h2>
              {cartItemsPay.length === 0 ? (
                <p className="text-text-secondary py-4 text-center">
                  Giỏ hàng của bạn đang trống.
                </p>
              ) : (
                cartItemsPay.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border-primary py-3 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg mr-4 border border-border-secondary shadow-sm"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/100x100/E2E8F0/4A5568?text=Lỗi+Ảnh";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-text-primary text-base">
                          {item.name}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          Giá niêm yết: {formatCurrency(item.old_price)}
                        </p>
                        <p className="text-sm text-text-secondary">
                          Giá thanh toán:{" "}
                          <span className="font-semibold text-price-primary">
                            {formatCurrency(item.price)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-price-primary text-lg">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 mt-6 lg:mt-0">
            <div className="bg-bg-content rounded-lg shadow-inner p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-text-primary border-b border-border-primary pb-2">
                Tóm tắt đơn hàng
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-text-secondary">
                  <span>Tổng sản phẩm:</span>
                  <span className="font-medium">{cartItemsPay.length}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tổng giá gốc sản phẩm:</span>
                  <span className="font-medium">
                    {formatCurrency(subtotalBeforeTax)}
                  </span>
                </div>
                {backendTaxValue > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Thuế ({backendTaxValue}%):</span>
                    <span className="font-medium">
                      {formatCurrency(backendTaxAmount)}
                    </span>
                  </div>
                )}
                {backendRoleDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>
                      Chiết khấu vai trò ({backendRoleDiscountValue}%):
                    </span>
                    <span className="font-medium">
                      -{formatCurrency(backendRoleDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-text-primary font-semibold border-t border-border-primary pt-2">
                  <span>Tổng tiền (sau thuế & chiết khấu vai trò):</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(totalWithTaxAndRoleDiscount)}
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="text-accent-primary">
                    <div className="flex justify-between items-center text-base">
                      <span className="font-semibold">
                        Mã giảm giá đã áp dụng:
                      </span>
                      <span className="font-bold">{appliedDiscount.code}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">Giá trị giảm từ mã:</span>
                      <span className="font-semibold text-lg">
                        -
                        {formatCurrency(
                          appliedDiscount.discount_amount -
                            backendRoleDiscountAmount
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border-primary pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-2xl text-text-primary">
                    Tổng thanh toán:
                  </span>
                  <span className="font-bold text-price-primary text-3xl">
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
              </div>

              <div className="mb-4 bg-bg-secondary p-4 rounded-lg">
                <label
                  htmlFor="discountCode"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Áp dụng mã giảm giá
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="discountCode"
                    value={discountCodeInput}
                    onChange={(e) => {
                      setDiscountCodeInput(e.target.value);
                      if (discountErrorMessage && e.target.value) {
                        setDiscountErrorMessage(""); // Clear error when user starts typing
                      }
                    }}
                    placeholder="Nhập mã của bạn"
                    className={`flex-grow input-primary ${
                      discountErrorMessage ? "border-price-error" : ""
                    }`}
                  />
                  <button
                    onClick={() => handleApplyDiscountCode()}
                    className="button-secondary text-sm px-4 py-2"
                  >
                    Áp dụng
                  </button>
                </div>
                {discountErrorMessage && (
                  <p className="text-price-error text-sm mt-2">
                    {discountErrorMessage}
                  </p>
                )}
                {appliedDiscount && (
                  <button
                    onClick={handleRemoveDiscount}
                    className="text-xs text-price-error hover:text-price-error-hover mt-2 flex items-center"
                  >
                    <X size={12} className="mr-1" /> Xóa mã "
                    {appliedDiscount.code}"
                  </button>
                )}
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="mt-3 text-sm text-accent-primary hover:text-accent-primary-hover flex items-center font-medium"
                >
                  <Gift size={18} className="mr-2" /> Xem các mã giảm giá của
                  bạn
                </button>
              </div>

              {/* Removed the dedicated "Số dư tài khoản" section */}
              {finalAmount > userBalance && (
                <div className="mb-4 bg-bg-secondary p-4 rounded-lg">
                  <p className="text-price-error text-sm mt-3">
                    Số dư không đủ để thanh toán. Vui lòng nạp thêm tiền để tiếp
                    tục.
                  </p>
                  <Link
                    to="/recharge-atm"
                    className="button-primary w-full mt-4 py-3 text-lg"
                  >
                    Nạp tiền ngay
                  </Link>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="terms"
                  className="flex items-center text-sm text-text-secondary cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="checkbox-primary mr-2 w-4 h-4"
                  />
                  Tôi đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="text-accent-primary hover:underline ml-1 mr-1 link-primary font-medium"
                  >
                    điều khoản và dịch vụ
                  </Link>{" "}
                  của website.
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={
                  loadingCheckout ||
                  finalAmount > userBalance ||
                  !termsAccepted ||
                  cartItemsPay.length === 0
                }
                className={`w-full py-3 rounded-lg text-lg font-bold transition-all duration-300 ${
                  loadingCheckout ||
                  finalAmount > userBalance ||
                  !termsAccepted ||
                  cartItemsPay.length === 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "button-primary"
                }`}
              >
                <CreditCard className="inline-block mr-3" size={24} />
                Thanh toán ({formatCurrency(finalAmount)})
              </button>

              <div className="mt-5 text-xs text-text-tertiary text-center">
                <p className="flex items-center justify-center">
                  <ShieldCheck size={16} className="mr-2 text-green-500" />
                  Giao dịch của bạn được bảo mật tuyệt đối.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        discounts={promotionCodes}
        onApplyDiscount={handleApplyDiscountCode}
        appliedPromotionCode={appliedDiscount?.code}
      />
    </div>
  );
}
