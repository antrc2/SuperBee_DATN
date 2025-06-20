"use client";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Crown, Copy } from "lucide-react";

export default function Product({ product }) {
  const formatPrice = (num) =>
    num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const oldPrice =
    product.sale > 0
      ? Math.round(product.price / (1 - product.sale / 100))
      : null;
  const discountPercent = product.sale;
  const primaryImage = product.images?.[0]?.image_url || null;

  const handleCopyId = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(product.sku);
  };

  return (
    <Link to={`/acc/${product.sku}`} className="block">
      <div
        className="
        flex flex-col 
        bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        rounded-xl border border-slate-700/50 
        hover:border-purple-500/50 transition-all duration-300 
        hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 
        overflow-hidden
        h-[460px]  
      "
      >
        {/* Phần 1: Ảnh (chiếm 40%) */}
        <div className="relative h-[40%] overflow-hidden">
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-2 py-1 rounded-full font-bold">
              -{discountPercent}%
            </div>
          )}
          {primaryImage ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_IMG}${primaryImage}`}
              alt={product.images[0]?.alt_text || `Product ID: ${product.id}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center">
              <Crown className="w-16 h-16 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200">
              <Eye className="w-4 h-4" />
            </button>
            <button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phần 2: Nội dung chính (chiếm 40%) */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">ID:</span>
              <span className="text-xs text-purple-300 font-mono truncate">
                {product.sku}
              </span>
              <button
                onClick={handleCopyId}
                className="h-4 w-4 p-0 text-gray-400 hover:text-purple-300 transition-colors duration-200"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <h3 className="font-bold text-sm text-white mb-3 truncate">
              {product.category.name}
            </h3>

            {product.game_attributes?.length > 0 && (
              <div className="space-y-1 max-h-[100px] overflow-y-auto">
                {product.game_attributes.slice(0, 4).map((attr) => (
                  <div key={attr.id} className="flex justify-between text-xs">
                    <span
                      className="text-gray-400 truncate max-w-[60%]"
                      title={attr.attribute_key}
                    >
                      {attr.attribute_key}:
                    </span>
                    <span
                      className="text-purple-300 font-medium truncate max-w-[35%]"
                      title={attr.attribute_value}
                    >
                      {attr.attribute_value}
                    </span>
                  </div>
                ))}
                {product.game_attributes.length > 4 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{product.game_attributes.length - 4} thuộc tính khác
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phần 3: Giá & nút (chiếm 20%) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-yellow-400">
                  {formatPrice(product.price)}
                </span>
                {oldPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(oldPrice)}
                  </span>
                )}
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
              MUA NGAY
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
