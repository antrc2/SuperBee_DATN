"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Zap,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import api from "@utils/http";
import { useParams } from "react-router-dom";
import { useCart } from "@contexts/CartContext";
import Image from "../../../components/Client/Image/Image";
import Breadcrumbs from "../../../utils/Breadcrumbs";

// Định nghĩa component Button với dark theme
const Button = ({ variant, size, className, disabled, children, ...props }) => {
  let baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  if (variant === "outline") {
    baseClasses +=
      " border border-gray-700 bg-gray-900/50 hover:bg-gray-800/80 hover:border-gray-600 text-gray-300 hover:text-white";
  } else {
    // default variant
    baseClasses +=
      " bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl";
  }

  return (
    <button
      className={`${baseClasses} ${className || ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Định nghĩa component Badge với dark theme
const Badge = ({ className, children, ...props }) => {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-gray-700 bg-gray-900/50 px-2.5 py-0.5 text-xs font-semibold text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

export default function ProductDetail() {
  const { slug } = useParams();
  const { handleAddToCart, handlePayNow } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [product, setProduct] = useState(null);

  const VITE_BACKEND_IMG = import.meta.env.VITE_BACKEND_IMG || "";

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/acc/${slug}`);
      const productData = res.data?.data[0];
      if (productData) {
        setProduct(productData);
        if (productData.images && productData.images.length > 0) {
          setSelectedImageIndex(0);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [slug]);

  const handleAddToCartClick = async () => {
    if (product) {
      setIsAddingToCart(true);
      await handleAddToCart(product);
      setIsAddingToCart(false);
    }
  };

  const handleBuyNowClick = async () => {
    if (product) {
      setIsLoading(true);
      await handlePayNow(product);
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (isLoading) return <LoadingDomain />;

  if (!product) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-2">⚠️</div>
          <div className="text-gray-300 text-lg">
            Không tìm thấy thông tin sản phẩm.
          </div>
        </div>
      </div>
    );
  }

  const currentImageSrc =
    product.images && product.images[selectedImageIndex]
      ? `${VITE_BACKEND_IMG}${product.images[selectedImageIndex].image_url}`
      : "/placeholder.svg";

  return (
    <div className="min-h-screen  text-white">
      {/* Container với padding responsive */}
      <Breadcrumbs category={product?.category} />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Grid layout responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Image Gallery - Responsive */}
            <div className="order-1 lg:order-1">
              <div className="space-y-4">
                {/* Main Image với navigation */}
                <div className="relative group">
                  <div className="aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl">
                    <img
                      src={currentImageSrc}
                      alt={
                        (product.images &&
                          product.images[selectedImageIndex]?.alt_text) ||
                        "Product"
                      }
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />

                    {/* Navigation Arrows - Ẩn trên mobile nhỏ */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 /60 hover:/80 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 /60 hover:/80 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 /70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm">
                        {selectedImageIndex + 1} / {product.images.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery - Responsive */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 justify-start overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          selectedImageIndex === index
                            ? "border-blue-500 shadow-lg shadow-blue-500/25"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <Image
                          url={image.image_url || "/placeholder.svg"}
                          alt={image.alt_text || `Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-blue-500/20" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Features - Responsive grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-4 bg-gray-900/70 rounded-lg border border-gray-800 backdrop-blur-sm">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-400">
                      Bảo hành
                    </div>
                    <div className="text-xs sm:text-sm text-green-400 font-medium">
                      Trọn đời
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-900/70 rounded-lg border border-gray-800 backdrop-blur-sm">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-400">
                      Giao hàng
                    </div>
                    <div className="text-xs sm:text-sm text-yellow-400 font-medium">
                      Tức thì
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-900/70 rounded-lg border border-gray-800 backdrop-blur-sm">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-400">
                      Chất lượng
                    </div>
                    <div className="text-xs sm:text-sm text-purple-400 font-medium">
                      Cao cấp
                    </div>
                  </div>
                </div>

                {/* Description - Chỉ hiển thị trên desktop */}
                <div className="hidden lg:block bg-gray-900/70 border border-gray-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Mô tả
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {product.description ||
                      "Sản phẩm chất lượng cao, được kiểm duyệt kỹ lưỡng. Đảm bảo uy tín và chất lượng, hỗ trợ 24/7."}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Info - Responsive */}
            <div className="order-2 lg:order-2">
              <div className="space-y-4 sm:space-y-6">
                {/* Product Title - Responsive text */}
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                    {product.category?.name || "Tên sản phẩm"}
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-gray-500 text-sm">Mã:</span>
                    <code className="bg-gray-900 text-blue-400 px-2 py-1 rounded text-sm font-mono border border-gray-800">
                      #{product.sku}
                    </code>
                  </div>
                </div>

                {/* Game Attributes - Responsive */}
                {product.game_attributes &&
                  product.game_attributes.length > 0 && (
                    <div className="bg-gray-900/70 rounded-xl p-4 sm:p-6 border border-gray-800 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Thông Tin
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {product.game_attributes.map((attr) => (
                          <div
                            key={attr.id}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-3 sm:px-4 bg-gray-800/50 rounded-lg text-sm border border-gray-700/50"
                          >
                            <span className="text-gray-400 font-medium mb-1 sm:mb-0">
                              {attr.attribute_key}
                            </span>
                            <span className="text-purple-400 font-semibold">
                              {attr.attribute_value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Description - Chỉ hiển thị trên mobile */}
                <div className="block lg:hidden bg-gray-900/70 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Mô tả
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {product.description ||
                      "Sản phẩm chất lượng cao, được kiểm duyệt kỹ lưỡng. Đảm bảo uy tín và chất lượng, hỗ trợ 24/7."}
                  </p>
                </div>

                {/* Price - Responsive */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {product.price.toLocaleString("vi-VN")}đ
                  </div>
                  {product.sale > 0 && (
                    <div className="text-gray-500 line-through text-base sm:text-lg mt-1">
                      {(product.price + product.sale).toLocaleString("vi-VN")}đ
                    </div>
                  )}
                </div>

                {/* Action Buttons - Responsive */}
                <div className="space-y-3 sm:space-y-4">
                  <Button
                    onClick={handleBuyNowClick}
                    disabled={isLoading}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Mua Ngay
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Button
                      onClick={handleAddToCartClick}
                      disabled={isAddingToCart}
                      variant="outline"
                      className="h-10 sm:h-12 bg-gray-900/50 border-gray-700 text-purple-400 hover:bg-purple-900/30 hover:border-purple-500 transition-all duration-300 text-sm sm:text-base"
                    >
                      {isAddingToCart ? (
                        <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Giỏ hàng</span>
                          <span className="sm:hidden">Giỏ</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="h-10 sm:h-12 bg-gray-900/50 border-gray-700 text-pink-400 hover:bg-pink-900/30 hover:border-pink-500 transition-all duration-300 text-sm sm:text-base"
                    >
                      <Heart className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Yêu thích</span>
                      <span className="sm:hidden">Thích</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
