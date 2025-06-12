import React from "react";
import { Link } from "react-router-dom";

export default function Product({ product }) {
  const formatPrice = (num) =>
    num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const Card = ({ className = "", children }) => (
    <div className={`bg-white border rounded-lg ${className}`}>{children}</div>
  );

  const CardContent = ({ className = "", children }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );

  const Badge = ({ className = "", children }) => (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );

  // Calculate old price and discount if there's a sale
  const oldPrice =
    product.sale > 0 ? product.price / (1 - product.sale / 100) : product.price;
  const discount = product.sale;

  return (
    <Link to={`/acc/${product.sku}`}>
      <Card className="rounded-2xl shadow-md overflow-hidden">
        <img
          // Use the first image from the 'images' array
          src={`${import.meta.env.VITE_BACKEND_IMG}${
            product.images[0]?.image_url
          }`}
          alt={product.images[0]?.alt_text || `Product ID: ${product.id}`} // Fallback alt text
          className="w-full h-40 object-cover"
        />
        <CardContent>
          <h2 className="text-lg font-semibold leading-snug">
            {product.category.name}
          </h2>
          <p className="text-sm text-gray-500 mb-1">ID: {product.sku}</p>

          {/* Dynamically display game attributes */}
          {product.game_attributes && product.game_attributes.length > 0 && (
            <ul className="text-sm text-gray-700 space-y-0.5 mt-2">
              {product.game_attributes.map(
                (attr, index) =>
                  index < 4 && (
                    <li key={attr.id}>
                      {attr.attribute_key}: {attr.attribute_value}
                    </li>
                  )
              )}
            </ul>
          )}

          <div className="mt-4">
            <span className="text-blue-600 font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && ( // Only show old price and badge if there's a discount
              <div className="flex items-center gap-2 mt-1">
                <span className="line-through text-sm text-gray-400">
                  {formatPrice(oldPrice)}
                </span>
                <Badge className="bg-pink-500 text-white text-xs">
                  {discount}%
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
