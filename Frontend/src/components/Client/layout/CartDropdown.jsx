"use client";

import { X, ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Image from "../Image/Image";

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
          ? "h-full flex flex-col custom-scrollbar-notification  backdrop-blur-xl bg-gradient-header "
          : "absolute right-0 top-full z-20 mt-3 w-80 sm:w-96 rounded-2xl  bg-gradient-header custom-scrollbar-notification  backdrop-blur-xl shadow-2xl"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white"> Giỏ hàng</h3>
          {cartItems.length > 0 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
              {cartItems.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-300"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>

      {/* Cart Items */}
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
              className="flex gap-4 p-4 border-b border-purple-500/10 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-cyan-600/10 transition-all duration-300 group"
              onClick={onClose}
            >
              {/* Product Image */}
              <div className="relative flex-shrink-0">
                <Image
                  url={`${item?.product?.images[0]?.image_url}`}
                  alt={item?.name}
                  className="h-16 w-16 rounded-xl object-cover border-2 border-purple-400/30 group-hover:border-cyan-400/60 transition-colors duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/64x64/667eea/ffffff?text=🎮";
                  }}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">✓</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors duration-300 truncate">
                  {item?.product?.category?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item?.product?.sale ? (
                    <>
                      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                        {item?.product?.sale}đ
                      </p>
                      <p className="text-sm font-bold text-gray-500 line-through">
                        {item?.product?.price}đ
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                      {item?.product?.price}đ
                    </p>
                  )}
                  {/* Bạn có thể bỏ comment dòng HOT nếu muốn hiển thị */}
                  {/* <span className="px-2 py-0.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
    HOT
  </span> */}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-sm text-white/60 mb-2">
              Giỏ hàng của bạn đang trống
            </p>
            <p className="text-xs text-white/40">
              Hãy thêm acc game yêu thích vào giỏ hàng!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="p-4 border-t border-purple-500/20">
          <Link
            to={`/cart`}
            className="block w-full text-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
            onClick={onClose}
          >
            🛒 Xem giỏ hàng ({cartItems.length})
          </Link>
        </div>
      )}
    </div>
  );
}
