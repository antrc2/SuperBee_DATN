// src/components/Client/product/Product.jsx
"use client";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Copy, Info } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";
import { useCart } from "@contexts/CartContext";
import { formatCurrencyVND } from "../../../config/recharge";

export default function Product({ product }) {
  const { pop } = useNotification();
  const { handleAddToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    handleAddToCart(product);
  };

  const handleCopyId = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(product.sku);
    pop("Đã sao chép ID sản phẩm!", "success");
  };

  const finalPrice =
    product.sale > 0 && product.sale < product.price
      ? product.sale
      : product.price;
  const oldPrice =
    product.sale > 0 && product.sale < product.price ? product.price : null;
  const primaryImage =
    product.images?.[0]?.image_url || "https://i.imgur.com/g0j4g4A.jpeg";

  return (
    <Link to={`/acc/${product.sku}`} className="block group">
      <div className="bg-content rounded-xl border border-themed overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-accent/10">
        <div className="relative h-[160px] overflow-hidden">
          <img
            src={primaryImage}
            alt={product.category?.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAdd}
              className="bg-highlight/80 hover:bg-highlight text-accent-contrast rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm"
            >
              <ShoppingCart size={16} />
            </button>
            <div className="bg-primary/50 hover:bg-primary/80 text-white rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm">
              <Eye size={16} />
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-secondary mb-2">
              <span>ID: {product.sku}</span>
              <button onClick={handleCopyId} title="Copy ID">
                <Copy size={14} />
              </button>
            </div>
            <h3
              className="font-heading text-sm font-bold text-primary mb-3 truncate h-10"
              title={product.category?.name}
            >
              {product.category?.name}
            </h3>
            <div className="border-t border-themed my-2"></div>
            <div className="space-y-1 text-xs max-h-[80px] overflow-y-auto custom-scrollbar-notification">
              {product.game_attributes?.slice(0, 4).map((attr) => (
                <div key={attr.id} className="flex justify-between">
                  <span className="text-secondary truncate max-w-[60%]">
                    {attr.attribute_key}:
                  </span>
                  <span className="text-primary font-semibold truncate max-w-[35%]">
                    {attr.attribute_value}
                  </span>
                </div>
              ))}
              {product.game_attributes?.length > 4 && (
                <div className="text-xs text-secondary text-center pt-1">
                  + {product.game_attributes.length - 4} thuộc tính khác
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-end justify-between">
              <div>
                {oldPrice && (
                  <p className="text-xs text-secondary line-through">
                    {formatCurrencyVND(oldPrice)}
                  </p>
                )}
                <p className="font-heading text-lg font-bold text-highlight">
                  {formatCurrencyVND(finalPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
