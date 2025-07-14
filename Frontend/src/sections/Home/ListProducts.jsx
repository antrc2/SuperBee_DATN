import React from "react";
import { Gamepad2, ArrowRight } from "lucide-react";
import Product from "../../components/Client/product/Product";
import { Link } from "react-router-dom"; // Import Link

export default function ListProducts({
  title,
  subtitle,
  products = [], // Nhận trực tiếp danh sách sản phẩm
  viewMoreLink, // Link cho nút "Xem thêm"
}) {
  // Nếu không có sản phẩm nào thì không hiển thị section này
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="section-bg">
      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-button rounded-xl flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-5 h-5 text-accent-contrast" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary">
            {title}
          </h2>
        </div>
        <p className="text-secondary text-sm sm:text-base max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Product Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>

      {/* Nút Xem Thêm */}
      {viewMoreLink && (
        <div className="mt-8 text-center relative z-10">
          <Link
            to={viewMoreLink}
            className="inline-flex items-center gap-2 px-6 py-3 font-heading font-semibold text-accent-contrast bg-gradient-button rounded-xl shadow-lg hover:scale-105 transition-all"
          >
            Xem Thêm <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
