"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  Trash2,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../../contexts/CartContexts";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import { useNotification } from "../../../contexts/NotificationProvider";
import Image from "../../../components/Client/Image/Image";
import { Link } from "react-router-dom";

// Hàm định dạng tiền tệ an toàn
const formatCurrency = (amount) => {
  const numberAmount = Number(amount);
  if (isNaN(numberAmount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numberAmount);
};

// --- LOGIC MỚI: Sửa lại hàm tính giá cuối cùng ---
// Hàm này sẽ trả về giá sale nếu hợp lệ, nếu không thì trả về giá gốc.
const calculateFinalPrice = (product) => {
  if (!product || !product.price) return 0;
  const originalPrice = Number(product.price);
  const salePrice = Number(product.sale);

  // Nếu có giá sale hợp lệ (thấp hơn giá gốc), thì đó là giá cuối cùng
  if (salePrice > 0 && salePrice < originalPrice) {
    return salePrice;
  }
  // Mặc định trả về giá gốc
  return originalPrice;
};

export default function CartPage() {
  const [selectedItems, setSelectedItems] = useState({});
  const { conFim } = useNotification();
  const {
    removeItem,
    fetchCartItems,
    cartItems,
    loadingCart,
    handleUpdateSave,
  } = useCart();

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const selected = {};
      cartItems.forEach((item) => {
        if (item.status === 1) {
          selected[item.id] = true;
        }
      });
      setSelectedItems(selected);
    }
  }, [cartItems]);

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelectedItems = {};
    if (isChecked) {
      cartItems.forEach((item) => {
        newSelectedItems[item.id] = true;
      });
    }
    setSelectedItems(newSelectedItems);
  };

  const handleRemoveItem = async (itemId, itemName) => {
    if (
      await conFim(`Bạn có chắc chắn muốn xóa "${itemName}" khỏi giỏ hàng?`)
    ) {
      await removeItem(itemId);
    }
  };

  // `useMemo` này sẽ tự động tính đúng vì `calculateFinalPrice` đã được sửa
  const { totalSelectedCount, subtotalPrice, totalPrice, isAllSelected } =
    useMemo(() => {
      const itemsToCheckout = cartItems.filter(
        (item) => selectedItems[item.id]
      );
      const totalSelectedCount = itemsToCheckout.length;

      const subtotalPrice = itemsToCheckout.reduce(
        (sum, item) => sum + calculateFinalPrice(item.product),
        0
      );

      const shippingFee = 0;
      const totalPrice = subtotalPrice + shippingFee;
      const isAllSelected =
        cartItems.length > 0 &&
        cartItems.every((item) => selectedItems[item.id]);

      return {
        totalSelectedCount,
        subtotalPrice,
        totalPrice,
        isAllSelected,
      };
    }, [cartItems, selectedItems]);

  const handlePay = async () => {
    handleUpdateSave(selectedItems);
  };

  if (loadingCart) return <LoadingDomain />;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12">
            <ShoppingCart size={80} className="mx-auto text-blue-400 mb-6" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="mb-8 text-slate-300">
              Hãy khám phá thêm sản phẩm tuyệt vời của chúng tôi!
            </p>
            <Link
              to={`/`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <ChevronLeft size={20} className="mr-2" />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Giỏ hàng ({cartItems.length} sản phẩm)
          </h1>
          <Link
            to={`/`}
            className="inline-flex items-center font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            <ChevronLeft size={20} className="mr-1" />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="lg:flex gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:w-2/3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              {/* Select All Header */}
              <div className="flex items-center mb-6 pb-4 border-b border-slate-700/50">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        isAllSelected
                          ? "bg-blue-500 border-blue-500 flex items-center justify-center"
                          : "border-slate-500 group-hover:border-blue-400"
                      }`}
                    >
                      {isAllSelected && (
                        <svg
                          className="w-3 h-3 text-white flex items-center justify-center"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </span>
                </label>
              </div>

              {/* Product List */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const originalPrice = Number(product.price);
                  const salePrice = Number(product.sale);
                  let discountPercent = 0;

                  if (salePrice > 0 && salePrice < originalPrice) {
                    const discountAmount = originalPrice - salePrice;
                    discountPercent = Math.round(
                      (discountAmount / originalPrice) * 100
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center flex-1">
                        {/* Checkbox */}
                        <label className="flex items-center cursor-pointer group mr-4">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={!!selectedItems[item.id]}
                              onChange={() => handleSelectItem(item.id)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                selectedItems[item.id]
                                  ? "bg-blue-500 border-blue-500 flex items-center justify-center"
                                  : "border-slate-500 group-hover:border-blue-400"
                              }`}
                            >
                              {selectedItems[item.id] && (
                                <svg
                                  className="w-3 h-3 text-white flex items-center justify-center"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </label>

                        {/* Product Image */}
                        <div className="relative mr-4">
                          <Image
                            url={
                              product?.images[0]?.image_url ||
                              "/placeholder.svg?height=100&width=100"
                            }
                            alt={product?.category?.name || "Sản phẩm"}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-slate-600/50"
                          />
                          {/* Hiển thị % đã tính toán */}
                          {/* {discountPercent > 0 && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{discountPercent}%
                            </div>
                          )} */}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg mb-1">
                            {product?.category?.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Mã sản phẩm:{" "}
                            <span className="text-blue-400 font-mono">
                              {product?.sku}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xl font-bold text-red-400">
                            {/* Hàm này giờ đã tính đúng giá cuối cùng */}
                            {formatCurrency(calculateFinalPrice(product))}
                          </div>
                          {/* Hiển thị giá gốc khi có giảm giá */}
                          {discountPercent > 0 && (
                            <div className="text-sm text-slate-500 line-through">
                              {formatCurrency(originalPrice)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveItem(item.id, product?.category?.name)
                          }
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          aria-label={`Xóa ${product?.category?.name}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-300">Sản phẩm đã chọn:</span>
                  <span className="text-white font-semibold">
                    {totalSelectedCount}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-300">Tạm tính:</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(subtotalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-300">Phí giao dịch:</span>
                  <span className="text-green-400 font-semibold">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-red-400">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={totalSelectedCount === 0}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
                  totalSelectedCount === 0
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02]"
                }`}
              >
                <CreditCard className="mr-3" size={20} />
                Thanh toán ({totalSelectedCount})
              </button>

              <div className="mt-6 text-center">
                <p className="flex items-center justify-center text-sm text-slate-400">
                  <ShieldCheck size={16} className="mr-2 text-green-400" />
                  Giao dịch an toàn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
