import { useEffect, useRef } from "react";
import { useHome } from "@contexts/HomeContext";
import ListCategoryCha from "../../../sections/Home/ListCategoryCha";
import CategoryCha from "../Category/CategoryCha";

export default function CategoryDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const { homeData } = useHome();
  const categories = homeData?.categories ?? [];
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
      className="absolute left-0 md:left-auto top-full z-20 mt-3 w-full md:w-[700px] lg:w-[800px] rounded-2xl bg-gradient-header  backdrop-blur-xl p-6 shadow-2xl border border-purple-500/20"
    >
      {/* Header */}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.treeCategories?.map((e, i) => (
          <CategoryCha item={e} key={i} onClose={onClose} />
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
