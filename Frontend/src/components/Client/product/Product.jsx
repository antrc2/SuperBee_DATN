import React from "react";

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

  return (
    <Card className="rounded-2xl shadow-md overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <CardContent>
        <h2 className="text-lg font-semibold leading-snug">{product.name}</h2>
        <p className="text-sm text-gray-500 mb-1">ID: {product.id}</p>
        <ul className="text-sm text-gray-700 space-y-0.5">
          <li>Đăng Ký: {product.register}</li>
          <li>Skin Súng: {product.skin}</li>
          <li>Thẻ Vô Cực: {product.theVoCuc}</li>
          <li>Mức Rank: {product.rank}</li>
        </ul>
        <div className="mt-2">
          <span className="text-blue-600 font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="line-through text-sm text-gray-400">
              {formatPrice(product.oldPrice)}
            </span>
            <Badge className="bg-pink-500 text-white text-xs">
              {product.discount}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
