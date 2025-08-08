// src/components/Client/Category/CategoryCon.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ item, onClose }) {
  const category = {
    name: item?.name || "Tên danh mục",
    slug: item?.slug || "category-slug",
    image: item?.image || item?.image_url || "https://i.imgur.com/g0j4g4A.jpeg",
  };

  return (
    <Link
      to={`/mua-acc/${category.slug}`}
      onClick={onClose}
      className="group block category-card-glow rounded-xl"
    >
      <div
        onClick={onClose}
        className="group w-full cursor-pointer bg-content border border-themed rounded-xl p-3 transition-all duration-300 hover:border-accent hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          {/* Vùng ảnh tròn nhỏ */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-themed">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Vùng nội dung */}
          <div className="flex-grow min-w-0">
            <h3 className="font-heading text-sm font-bold text-primary truncate">
              {category.name}
            </h3>
            <p className="text-xs text-secondary mt-1">Xem tài khoản</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
