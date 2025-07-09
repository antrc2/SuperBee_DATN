import { Sparkles, Package } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../Image/Image";

export default function CategoryCardV2({ item, onClose }) {
  // Dữ liệu mẫu trong trường hợp item không có đủ thông tin
  const category = {
    name: item?.name || "Tên danh mục",
    slug: item?.slug || "category-slug",
    image:
      item?.image || "https://placehold.co/600x400/1a1a2e/ffffff?text=Image",
    description:
      item?.description || "Khám phá các tài khoản độc đáo trong danh mục này.",
    count: item?.count || 0,
  };

  return (
    <Link
      to={`mua-acc/${category.slug}`}
      onClick={onClose}
      className="group block [perspective:1000px]"
    >
      <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(10deg)_rotateX(-5deg)]">
        {/* Main Card Body */}
        <div className="relative flex flex-col h-56 w-full rounded-2xl overflow-hidden bg-[#1a1a2e] border border-purple-500/30 shadow-lg shadow-purple-900/20">
          {/* Background Image Section */}
          <div className="h-2/5 w-full relative overflow-hidden">
            <Image
              url={category.image}
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-between p-4 text-white">
            <div>
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">
                {category.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="flex items-center gap-2 text-cyan-400">
                <Package size={16} />
                <span>
                  <span className="font-bold">{category.count}</span> tài khoản
                </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles size={16} className="animate-pulse" />
                <span>Mới</span>
              </div>
            </div>
          </div>

          {/* 3D Shine Effect on Hover */}
          <div
            className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)",
              transform: "translateZ(50px)",
            }}
          ></div>

          {/* Animated Border on Hover */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-500/80 transition-all duration-300 pointer-events-none"></div>
        </div>
      </div>
    </Link>
  );
}
