"use client";

import { useEffect, useRef } from "react";

export default function CategoryDropdown({ categories, isOpen, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 md:left-auto top-full z-20 mt-3 w-full md:w-[700px] lg:w-[800px] rounded-2xl bg-gradient-to-b from-slate-900 via-purple-900/95 to-slate-900 backdrop-blur-xl p-6 shadow-2xl border border-purple-500/20"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">
          🎮 Danh mục game hot
        </h3>
        <p className="text-sm text-white/60">Chọn loại acc game bạn muốn mua</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            className="group relative flex flex-col items-center gap-3 rounded-xl p-4 hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-pink-600/20 transition-all duration-300 border border-white/10 hover:border-purple-400/50 backdrop-blur-sm overflow-hidden"
            onClick={onClose}
          >
            {/* Background glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}
            ></div>

            {/* Icon with glow */}
            <div className="relative">
              <category.icon className="h-12 w-12 text-white/80 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`}
              ></div>
            </div>

            {/* Category name */}
            <span className="relative text-center text-sm font-semibold text-white/90 group-hover:text-white transition-colors duration-300 leading-tight">
              {category.name}
            </span>

            {/* Hover effect border */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-400/30 transition-colors duration-300"></div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-purple-500/20">
        <p className="text-center text-xs text-white/50">
          ⚡ Cập nhật liên tục • 🔒 Bảo mật tuyệt đối • 💎 Chất lượng cao
        </p>
      </div>
    </div>
  );
}
