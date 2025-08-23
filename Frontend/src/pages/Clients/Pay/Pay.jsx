import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Tag,
  X,
  CreditCard,
  ShieldCheck,
  Gift,
  TicketPercent,
  ChevronRight,
  ListOrdered,
  FileText,
  Wallet,
  Landmark,
} from "lucide-react";
import { useCart } from "@contexts/CartContext";
import { useNotification } from "@contexts/NotificationContext";
import { Link, useNavigate } from "react-router-dom";
import LoadingDomain from "@components/Loading/LoadingDomain";
import api from "@utils/http";
import { useAuth } from "../../../contexts/AuthContext";

// Hàm định dạng tiền tệ không thay đổi
const formatCurrency = (amount) => {
  const numberAmount = Number(amount);
  if (isNaN(numberAmount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numberAmount);
};

// --- MODAL MÃ GIẢM GIÁ (Không thay đổi, đã được thiết kế lại ở lần trước) ---
const DiscountModal = ({
  isOpen,
  onClose,
  discounts,
  onApplyDiscount,
  appliedPromotionCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="section-bg w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-themed">
          <h3 className="text-xl font-bold font-heading text-primary flex items-center">
            <Gift size={24} className="mr-2 text-accent" />
            Mã Giảm Giá Của Bạn
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-secondary hover:text-primary hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar-notification">
          {discounts.length === 0 ? (
            <p className="text-secondary text-center py-8">
              Bạn không có mã giảm giá nào.
            </p>
          ) : (
            <ul className="space-y-3">
              {discounts.map((discount) => (
                <li
                  key={discount.id}
                  className={`selection-grid-item text-left p-4 ${
                    appliedPromotionCode === discount.code
                      ? "selection-grid-item-selected"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <TicketPercent size={20} className="mr-2 text-accent" />
                        <span className="font-bold text-lg text-primary">
                          {discount.code}
                        </span>
                        {appliedPromotionCode === discount.code && (
                          <span className="ml-3 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-semibold">
                            Đang áp dụng
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary mb-2">
                        {discount.description || `Giảm ${discount.value}%`}
                      </p>
                      <div className="text-xs text-secondary/80 space-y-1 border-t border-themed pt-2 mt-2">
                        <p>
                          HSD:{" "}
                          <span className="font-medium">
                            {discount.expiry === "N/A"
                              ? "Vô thời hạn"
                              : new Date(discount.expiry).toLocaleDateString(
                                  "vi-VN"
                                )}
                          </span>
                        </p>
                        {discount.min_discount_amount > 0 && (
                          <p>
                            Đơn tối thiểu:{" "}
                            <span className="font-medium">
                              {formatCurrency(discount.min_discount_amount)}
                            </span>
                          </p>
                        )}
                        {discount.max_discount_amount > 0 && (
                          <p>
                            Giảm tối đa:{" "}
                            <span className="font-medium">
                              {formatCurrency(discount.max_discount_amount)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onApplyDiscount(discount.code);
                        onClose();
                      }}
                      disabled={appliedPromotionCode === discount.code}
                      className="action-button action-button-primary text-sm !py-2 !px-4 self-center disabled:!bg-tertiary disabled:!text-primary/80 disabled:cursor-not-allowed disabled:filter-none disabled:transform-none"
                    >
                      {appliedPromotionCode === discount.code
                        ? "Đã chọn"
                        : "Dùng ngay"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Component chính đã được thiết kế lại
export default function Pay() {
  const { pop, conFim } = useNotification();
  const { fetchCartItems } = useCart();
  const [cartItemsPay, setCartItemsPay] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [promotionCodes, setPromotionCodes] = useState([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(true);
  const [discountErrorMessage, setDiscountErrorMessage] = useState("");

  const [backendRawTotalPrice, setBackendRawTotalPrice] = useState(0);
  const [backendTotalPriceAfterDiscount, setBackendTotalPriceAfterDiscount] =
    useState(0);
  const [backendTaxAmount, setBackendTaxAmount] = useState(0);
  const [backendTaxValue, setBackendTaxValue] = useState(0);
  const [backendRoleDiscountAmount, setBackendRoleDiscountAmount] = useState(0);
  const [backendRoleDiscountValue, setBackendRoleDiscountValue] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { fetchUserMoney } = useAuth();

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

  const { subtotalBeforeTax, finalAmount } = useMemo(() => {
    const subtotalBeforeTaxAndRoleDiscount = backendRawTotalPrice;

    let currentTotal = backendTotalPriceAfterDiscount;

    if (appliedDiscount) {
      currentTotal = appliedDiscount.total_price_after_discount;
    }

    return {
      subtotalBeforeTax: subtotalBeforeTaxAndRoleDiscount,
      finalAmount: currentTotal,
    };
  }, [backendRawTotalPrice, backendTotalPriceAfterDiscount, appliedDiscount]);

  const handleApplyDiscountCode = async (codeToApply = discountCodeInput) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setDiscountErrorMessage("Vui lòng nhập mã giảm giá.");
      return;
    } else {
      setDiscountErrorMessage("");
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
        setBackendTaxAmount(
          parseFloat(response.data.tax_value)  || 10
        );
        setBackendTaxValue(
          parseFloat(response.data.tax_amount) || 0
        );
        pop(response.data.message, "success");
        setDiscountCodeInput("");
        setDiscountErrorMessage("");
      } else {
        setAppliedDiscount(null);
        setDiscountErrorMessage(response.data.message);
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
      setDiscountErrorMessage(errorMessage);
      setAppliedDiscount(null);
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
    setDiscountErrorMessage("");

    try {
      const response = await api.get("/orders/checkout");
      if (response.data.status) {
        setBackendTotalPriceAfterDiscount(
          parseFloat(response.data.total_price_after_discount) || 0
        );
        pop("Đã xóa mã giảm giá.", "success");
      } else {
        pop("Lỗi khi khôi phục giá gốc.", "error");
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
      pop("Số dư không đủ. Vui lòng nạp thêm tiền.", "error");
      return;
    }

    if (!(await conFim("Xác nhận thanh toán đơn hàng này?"))) return;

    setIsProcessing(true);

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
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingCheckout) return <LoadingDomain />;

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        {/* Breadcrumbs */}
        <div className="breadcrumbs-container p-4  ">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <ChevronRight size={16} className="breadcrumb-separator" />
          <Link to="/cart" className="breadcrumb-link">
            Giỏ hàng
          </Link>
          <ChevronRight size={16} className="breadcrumb-separator" />
          <span className="text-primary font-semibold">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cột chính (trái) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Card: Xem lại đơn hàng */}
            <div className="section-bg p-6">
              <h2 className="text-xl font-bold font-heading mb-4 text-primary flex items-center">
                <ListOrdered size={24} className="mr-3 text-accent" />
                Xem lại đơn hàng ({cartItemsPay.length})
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-notification">
                {cartItemsPay.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-input p-3 rounded-lg border border-themed"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md shadow-sm"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-primary">
                        {item.name}
                      </h3>
                      <p className="text-sm text-secondary">
                        Giá gốc: {formatCurrency(item.old_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phụ (phải) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-8">
              {/* Card: Ví của bạn */}
              <div className="section-bg p-6">
                <h2 className="text-xl font-bold font-heading mb-4 text-primary flex items-center">
                  <Wallet size={24} className="mr-3 text-accent" />
                  Ví của bạn
                </h2>
                <div
                  className={`p-4 rounded-lg flex items-center justify-between gap-5 ${
                    userBalance >= finalAmount
                      ? "bg-tertiary/20"
                      : "bg-red-500/10"
                  }`}
                >
                  <div>
                    <p className="text-sm text-secondary">Số dư khả dụng</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(userBalance)}
                    </p>
                  </div>
                  {userBalance < finalAmount && (
                    <Link
                      to="/recharge-atm"
                      className="action-button action-button-primary !py-2 !px-4 text-sm"
                    >
                      <Landmark size={16} className="mr-2" />
                      Nạp tiền
                    </Link>
                  )}
                </div>
                {userBalance < finalAmount && (
                  <p className="text-red-500 text-sm mt-2 font-semibold">
                    Số dư không đủ để thực hiện thanh toán.
                  </p>
                )}
              </div>
              {/* Card: Mã giảm giá */}
              <div className="section-bg p-6">
                <h2 className="text-xl font-bold font-heading mb-4 text-primary flex items-center">
                  <TicketPercent size={24} className="mr-3 text-accent" />
                  Mã giảm giá
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={discountCodeInput}
                    onChange={(e) =>
                      setDiscountCodeInput(e.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã của bạn ở đây"
                    className="flex-grow w-full bg-input text-input p-3 rounded-md border-hover placeholder-theme"
                  />
                  <button
                    onClick={() => handleApplyDiscountCode()}
                    className="action-button action-button-secondary !py-3 !px-6"
                  >
                    Áp dụng
                  </button>
                </div>
                {discountErrorMessage && (
                  <p className="text-red-500 text-sm mt-2">
                    {discountErrorMessage}
                  </p>
                )}
                <div className="mt-3 flex justify-between items-center">
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="text-sm text-accent hover:brightness-125 font-medium"
                  >
                    Xem danh sách mã giảm giá
                  </button>
                  {appliedDiscount && (
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-xs text-red-500 hover:underline flex items-center"
                    >
                      <X size={12} className="mr-1" /> Gỡ mã "
                      {appliedDiscount.code}"
                    </button>
                  )}
                </div>
              </div>
              {/* Card: Tổng kết thanh toán */}
              <div className="section-bg p-6">
                <h2 className="text-xl font-bold font-heading mb-4 text-primary flex items-center">
                  <FileText size={24} className="mr-3 text-accent" />
                  Tổng kết thanh toán
                </h2>
                <div className="space-y-3 text-sm">
                  {/* Dotted line separator */}
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Giá gốc sản phẩm</span>
                    <div className="flex-grow border-b border-dashed border-themed mx-2"></div>
                    <span className="font-medium text-primary">
                      {formatCurrency(subtotalBeforeTax)}
                    </span>
                  </div>
                  {backendRoleDiscountValue > 0 && (
                    <div className="flex items-center justify-between text-tertiary">
                      <span className="font-semibold">
                        Chiết khấu hạng ({backendRoleDiscountValue}%)
                      </span>
                      <div className="flex-grow border-b border-dashed border-tertiary/50 mx-2"></div>
                      <span className="font-semibold">
                        -{formatCurrency(backendRoleDiscountAmount)}
                      </span>
                    </div>
                  )}
                  
                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-accent">
                      <span className="font-semibold">
                        Mã giảm giá "{appliedDiscount.code}"
                      </span>
                      <div className="flex-grow border-b border-dashed border-accent/50 mx-2"></div>
                      <span className="font-semibold">
                        -{formatCurrency(appliedDiscount.discount_amount)}
                      </span>
                    </div>
                  )}
                  {backendTaxAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">
                        Thuế ({backendTaxValue}%)
                      </span>
                      <div className="flex-grow border-b border-dashed border-themed mx-2"></div>
                      <span className="font-medium text-primary">
                        +{formatCurrency(backendTaxAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-themed mt-4 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-primary">
                      Tổng thanh toán
                    </span>
                    <span className="font-bold text-red-500 text-3xl">
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card: Hành động cuối cùng */}
              <div className="section-bg p-6">
                <div className="mb-4">
                  <label
                    htmlFor="terms"
                    className="flex items-start text-sm text-secondary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 mr-3 mt-0.5 rounded"
                    />
                    <span>
                      Tôi đã đọc và đồng ý với các{" "}
                      <Link
                        to="/tin-tuc/huong-dan/dieu-khoan-va-dich-vu"
                        className="text-accent hover:underline font-medium"
                      >
                        điều khoản và dịch vụ
                      </Link>{" "}
                      của trang web.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={
                    loadingCheckout ||
                    finalAmount > userBalance ||
                    !termsAccepted ||
                    cartItemsPay.length === 0 ||
                    isProcessing
                  }
                  className="action-button action-button-primary w-full text-lg !py-4"
                >
                  <CreditCard className="inline-block mr-3" size={24} />
                  {isProcessing ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
                </button>

                <div className="mt-4 text-xs text-secondary text-center">
                  <p className="flex items-center justify-center">
                    <ShieldCheck size={14} className="mr-2 text-tertiary" />
                    Tất cả giao dịch đều được mã hóa và bảo mật.
                  </p>
                </div>
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