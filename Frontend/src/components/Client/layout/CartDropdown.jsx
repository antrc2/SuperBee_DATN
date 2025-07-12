"use client";

import { X, ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Image from "../Image/Image";
import { formatCurrencyVND } from "../../../utils/hook";

export default function CartDropdown({
  cartItems,
  isOpen,
  onClose,
  isMobile = false,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, isMobile]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col custom-scrollbar-notification bg-gradient-header"
          : "absolute right-0 top-full z-20 mt-3 w-80 sm:w-96 rounded-2xl bg-dropdown custom-scrollbar-notification backdrop-blur-xl shadow-2xl border-themed"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-themed">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-info" />
          <h3 className="text-lg font-bold text-primary"> Giỏ hàng</h3>
          {cartItems.length > 0 && (
            <span className="px-2 py-0.5 bg-gradient-success text-white text-xs font-bold rounded-full">
              {cartItems.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-secondary/60 hover:text-primary rounded-lg p-1.5 transition-colors"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className={`overflow-y-auto ${
          isMobile ? "flex-grow" : "max-h-80"
        } custom-scrollbar-notification`}
      >
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <Link
              to={`/acc/${item?.product?.sku}`}
              key={index}
              className="flex gap-4 p-4 border-b border-themed/50 hover:bg-primary/5 transition-colors group"
              onClick={onClose}
            >
              <div className="relative flex-shrink-0">
                <Image
                  url={`${item?.product?.images[0]?.image_url}`}
                  alt={item?.name}
                  className="h-16 w-16 rounded-xl object-cover border-2 border-themed group-hover:border-highlight transition-colors"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-success rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">✓</span>
                </div>
              </div>

              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-secondary group-hover:text-primary truncate">
                  {item?.product?.category?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item?.product?.sale ? (
                    <>
                      <p className="text-lg font-bold text-highlight ">
                        {formatCurrencyVND(item?.product?.sale)} VND
                      </p>
                      <p className="text-sm font-bold text-secondary/50 line-through">
                        {formatCurrencyVND(item?.product?.price)} VND
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold text-highlight ">
                      {formatCurrencyVND(item?.product?.price)} VND
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-secondary/40" />
            </div>
            <p className="text-sm text-secondary">
              Giỏ hàng của bạn đang trống
            </p>
            <p className="text-xs text-secondary/60">
              Hãy thêm acc game yêu thích vào giỏ hàng!
            </p>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 border-t border-themed">
          <Link
            to={`/cart`}
            className="block w-full text-center rounded-xl bg-gradient-info px-4 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all transform hover:scale-105"
            onClick={onClose}
          >
            🛒 Xem giỏ hàng ({cartItems.length})
          </Link>
        </div>
      )}
    </div>
  );
}
