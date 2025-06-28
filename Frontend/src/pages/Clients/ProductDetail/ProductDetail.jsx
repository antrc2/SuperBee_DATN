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
import LoadingDomain from "@components/Loading/LoadingDomain"; // Giả sử đường dẫn này chính xác
import api from "@utils/http"; // Giả sử đường dẫn này chính xác
import { useParams } from "react-router-dom";
import { useCart } from "@contexts/CartContext"; // Giả sử đường dẫn này chính xác
import Image from "../../../components/Client/Image/Image";

// Định nghĩa component Button ngay trong file này
const Button = ({ variant, size, className, disabled, children, ...props }) => {
  let baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  if (variant === "outline") {
    baseClasses +=
      " border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  } else {
    // default variant
    baseClasses += " bg-primary text-primary-foreground hover:bg-primary/90";
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

// Định nghĩa component Badge ngay trong file này
const Badge = ({ className, children, ...props }) => {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
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

  // Đảm bảo VITE_BACKEND_IMG được định nghĩa trong biến môi trường
  const VITE_BACKEND_IMG = import.meta.env.VITE_BACKEND_IMG || "";

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/acc/${slug}`);
      const productData = res.data?.data[0];

      if (productData) {
        setProduct(productData);
        if (productData.images && productData.images.length > 0) {
          setSelectedImageIndex(0); // Reset về ảnh đầu tiên khi có dữ liệu sản phẩm mới
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

  // ĐÃ XÓA useEffect CHO AUTO SLIDESHOW

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center text-white text-xl">
        Không tìm thấy thông tin sản phẩm.
      </div>
    );
  }

  const currentImageSrc =
    product.images && product.images[selectedImageIndex]
      ? `${VITE_BACKEND_IMG}${product.images[selectedImageIndex].image_url}`
      : "/placeholder.svg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery - Cột trái */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Image with Navigation */}
            <div className="relative group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 shadow-xl">
                <img
                  src={currentImageSrc}
                  alt={
                    (product.images &&
                      product.images[selectedImageIndex]?.alt_text) ||
                    "Product"
                  }
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Image Counter */}
                {product.images && product.images.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3 justify-start overflow-x-auto pb-2">
              {product.images?.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "border-cyan-400"
                      : "border-slate-700 hover:border-cyan-400 hover:opacity-90"
                  }`}
                >
                  <Image
                    url={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-black/30" />
                  )}
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-xs text-slate-300">Bảo hành</div>
                <div className="text-xs text-green-400 font-medium">
                  Trọn đời
                </div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-xs text-slate-300">Giao hàng</div>
                <div className="text-xs text-yellow-400 font-medium">
                  Tức thì
                </div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <Award className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <div className="text-xs text-slate-300">Chất lượng</div>
                <div className="text-xs text-purple-400 font-medium">
                  Cao cấp
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 border-slate-600/50 rounded-xl p-4 border">
              <h3 className="text-base font-semibold text-cyan-400 mb-2">
                Mô tả
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {product.description ||
                  "Sản phẩm chất lượng cao, được kiểm duyệt kỹ lưỡng. Đảm bảo uy tín và chất lượng, hỗ trợ 24/7."}
              </p>
            </div>
          </div>

          {/* Product Info - Cột phải */}
          <div className="space-y-6">
            {/* Product Title */}
            <div className="space-y-3">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                {product.category?.name || "Tên sản phẩm"}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">Mã:</span>
                <code className="bg-slate-800 text-cyan-400 px-2 py-1 rounded text-sm font-mono">
                  #{product.sku}
                </code>
              </div>
            </div>

            {/* Game Attributes */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Thông Tin
              </h3>
              <div className="space-y-2">
                {product.game_attributes?.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg text-sm"
                  >
                    <span className="text-slate-300 truncate pr-2">
                      {attr.attribute_key}
                    </span>
                    <span className="text-purple-400 font-medium text-right">
                      {attr.attribute_value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {product.price.toLocaleString("vi-VN")}đ
              </div>
              {product.sale > 0 && (
                <div className="text-slate-400 line-through text-lg">
                  {(product.price + product.sale).toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNowClick}
                disabled={isLoading}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Mua Ngay
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCartClick}
                  disabled={isAddingToCart}
                  variant="outline"
                  className="h-10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 text-sm"
                >
                  {isAddingToCart ? (
                    <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Giỏ hàng
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="h-10 bg-gradient-to-r from-pink-500/10 to-red-500/10 border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 transition-all duration-300 text-sm"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Yêu thích
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
