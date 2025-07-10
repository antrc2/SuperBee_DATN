import React, { useState } from "react";
import {
  ArrowUpRight,
  Users,
  Feather,
  Gamepad2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function CategoryCard({ item, onClick }) {
  console.log("🚀 ~ CategoryCard ~ item:", item);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigator = useNavigate();
  const category = {
    name: item?.name || "Thung Lũng Gió",
    slug: item?.slug || "thung-lung-gio",
    image: item?.image || item?.image_url,
    description:
      item?.description || "Khám phá một thế giới kỳ diệu và bình yên.",
    count: item?.count || 85,
  };

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const handleClick = () => {
    if (onClick) onClick();
    navigator(`/mua-acc/${item?.slug}`);
  };

  return (
    <>
      <div className="flex-shrink-0 ">
        <div
          onClick={handleClick}
          className="group relative cursor-pointer block w-full h-50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] border border-gray-700/50"
        >
          {/* Image Container */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            {!imageError && (
              <img
                src={category.image}
                alt={category.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Loading/Error State */}
            {(!imageLoaded || imageError) && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {imageError ? "Không thể tải ảnh" : "Đang tải..."}
                  </p>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-6">
            {/* Top Section - Arrow Icon */}
            <div className="flex justify-end">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transform translate-x-2 -translate-y-2 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out border border-white/20">
                <ArrowUpRight className="text-white w-5 h-5" />
              </div>
            </div>

            {/* Bottom Section - Content */}
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                {category.name}
              </h3>

              {/* Description & Count - Hidden by default, shown on hover */}
              <div className="opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-32 transition-all duration-500 ease-out">
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={14} className="text-cyan-400" />
                    <span className="font-medium">
                      {category.count} tài khoản
                    </span>
                  </div>

                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-500/30 transition-all duration-500 pointer-events-none"></div>
        </div>
      </div>
    </>
  );
}
