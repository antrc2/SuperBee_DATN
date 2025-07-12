"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  Trash2,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useCart } from "@contexts/CartContext";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import { useNotification } from "../../../contexts/NotificationContext";
import Image from "../../../components/Client/Image/Image";
import { Link } from "react-router-dom";

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  const numberAmount = Number(amount);
  if (isNaN(numberAmount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numberAmount);
};

// Hàm tính giá
const calculateFinalPrice = (product) => {
  if (!product || !product.price) return 0;
  const originalPrice = Number(product.price);
  const salePrice = Number(product.sale);
  if (salePrice > 0 && salePrice < originalPrice) {
    return salePrice;
  }
  return originalPrice;
};

export default function CartPage() {
  const [selectedItems, setSelectedItems] = useState({});
  const { pop, conFim } = useNotification();
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
        if (item.product && item.product.status === 1) {
          selected[item.id] = true;
        }
      });
      setSelectedItems(selected);
    }
  }, [cartItems]);

  const handleSelectItem = (itemId, productStatus) => {
    if (productStatus === 1) {
      setSelectedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelectedItems = {};
    if (isChecked) {
      cartItems.forEach((item) => {
        if (item.product && item.product.status === 1) {
          newSelectedItems[item.id] = true;
        }
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

  const handleRemoveSelected = async () => {
    const selectedIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id]
    );
    if (selectedIds.length === 0) {
      pop("Vui lòng chọn ít nhất một sản phẩm để xóa.", "warning");
      return;
    }
    if (
      await conFim(
        `Bạn có chắc muốn xóa ${selectedIds.length} sản phẩm đã chọn?`
      )
    ) {
      // Logic xóa nhiều sản phẩm (cần implement trong CartContext)
      // Ví dụ: await removeMultipleItems(selectedIds);
      // Hiện tại, ta sẽ xóa từng cái một
      for (const id of selectedIds) {
        await removeItem(id);
      }
      pop("Đã xóa các sản phẩm đã chọn.", "success");
    }
  };

  const { totalSelectedCount, subtotalPrice, totalPrice, isAllSelected } =
    useMemo(() => {
      const itemsToCheckout = cartItems.filter(
        (item) =>
          selectedItems[item.id] && item.product && item.product.status === 1
      );
      const totalSelectedCount = itemsToCheckout.length;
      const subtotalPrice = itemsToCheckout.reduce(
        (sum, item) => sum + calculateFinalPrice(item.product),
        0
      );
      const shippingFee = 0;
      const totalPrice = subtotalPrice + shippingFee;
      const availableItemsCount = cartItems.filter(
        (item) => item.product && item.product.status === 1
      ).length;
      const isAllSelected =
        availableItemsCount > 0 && totalSelectedCount === availableItemsCount;

      return { totalSelectedCount, subtotalPrice, totalPrice, isAllSelected };
    }, [cartItems, selectedItems]);

  const handlePay = async () => {
    handleUpdateSave(selectedItems);
  };

  if (loadingCart) return <LoadingDomain />;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center section-bg p-12">
          <ShoppingCart size={80} className="mx-auto text-accent mb-6" />
          <h1 className="text-3xl font-bold font-heading text-primary">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="my-4 text-secondary">
            Có vẻ như bạn chưa thêm sản phẩm nào. Hãy khám phá ngay!
          </p>
          <Link
            to={`/`}
            className="action-button action-button-primary max-w-xs mx-auto"
          >
            <ChevronLeft size={20} className="mr-2" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const selectedIds = Object.keys(selectedItems).filter(
    (id) => selectedItems[id]
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold font-heading text-primary flex items-center gap-3">
            <ShoppingCart size={32} className="text-accent" />
            Giỏ hàng ({cartItems.length})
          </h1>
          <Link
            to={`/`}
            className="inline-flex items-center font-bold text-accent transition-all hover:brightness-110"
          >
            <ChevronLeft size={20} className="mr-1" />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột chính (Danh sách sản phẩm) */}
          <div className="lg:col-span-2 section-bg p-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-themed">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded"
                />
                <span className="ml-3 text-secondary font-semibold">
                  Chọn tất cả (
                  {
                    cartItems.filter((i) => i.product && i.product.status === 1)
                      .length
                  }{" "}
                  sản phẩm)
                </span>
              </label>
              <button
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
                className="flex items-center text-sm text-red-500 hover:text-red-400 disabled:text-secondary/50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={16} className="mr-2" /> Xóa mục đã chọn
              </button>
            </div>

            {/* BẢNG SẢN PHẨM */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const finalPrice = calculateFinalPrice(product);
                const isGreyedOut = product.status !== 1;
                let statusMessage = "";
                if (product.status === 2) statusMessage = "Đang chờ duyệt";
                else if (product.status === 3) statusMessage = "Tạm hết hàng";
                else if (product.status === 4) statusMessage = "Đã bán";
                else if (product.status !== 1) statusMessage = "Không có sẵn";

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all duration-200 ${
                      isGreyedOut
                        ? "bg-input/50 opacity-60 cursor-not-allowed border-themed"
                        : "bg-input border-themed hover:border-hover"
                    }`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={!!selectedItems[item.id] && !isGreyedOut}
                        onChange={() =>
                          handleSelectItem(item.id, product.status)
                        }
                        disabled={isGreyedOut}
                        className="h-4 w-4 rounded"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-4">
                      <Image
                        url={
                          product?.images[0]?.image_url || "/placeholder.svg"
                        }
                        alt={product?.category?.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-themed"
                      />
                      <div>
                        <h3 className="font-semibold text-primary text-base mb-1">
                          {product?.category?.name}
                        </h3>
                        <p className="text-sm text-secondary">
                          Mã: <span className="font-mono">{product?.sku}</span>
                        </p>
                        {isGreyedOut && (
                          <p className="text-sm text-red-500 mt-1 font-semibold">
                            {statusMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-5 sm:col-span-3 text-right">
                      <p className="text-lg font-bold text-red-500">
                        {formatCurrency(finalPrice)}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-3 flex items-center justify-end sm:justify-center">
                      <button
                        onClick={() =>
                          handleRemoveItem(item.id, product?.category?.name)
                        }
                        className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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

          {/* Cột phụ (Tóm tắt đơn hàng) */}
          <div className="lg:col-span-1">
            <div className="section-bg p-6 sticky top-24">
              <h2 className="text-2xl font-bold font-heading mb-6 text-primary flex items-center gap-3">
                <FileText size={24} className="text-accent" />
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Sản phẩm đã chọn</span>
                  <div className="flex-grow border-b border-dashed border-themed mx-2"></div>
                  <span className="text-primary font-semibold">
                    {totalSelectedCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Tạm tính</span>
                  <div className="flex-grow border-b border-dashed border-themed mx-2"></div>
                  <span className="text-primary font-semibold">
                    {formatCurrency(subtotalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Phí giao dịch</span>
                  <div className="flex-grow border-b border-dashed border-themed mx-2"></div>
                  <span className="text-tertiary font-semibold">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-themed pt-6 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-semibold text-primary">
                    Tổng cộng:
                  </span>
                  <span className="text-3xl font-bold text-red-500">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={totalSelectedCount === 0}
                className="action-button action-button-primary w-full h-14 text-base"
              >
                <CreditCard className="mr-3" size={20} />
                Thanh toán ({totalSelectedCount})
              </button>

              <div className="mt-6 text-center">
                <p className="flex items-center justify-center text-sm text-secondary">
                  <ShieldCheck size={16} className="mr-2 text-tertiary" />
                  Giao dịch an toàn và bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
