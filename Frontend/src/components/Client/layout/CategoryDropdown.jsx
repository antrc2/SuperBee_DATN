import { useEffect, useRef } from "react";
import { useHome } from "@contexts/HomeContext";
import CategoryCha from "../Category/CategoryCha";

export default function CategoryDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const { homeData } = useHome();
  const categories = homeData?.data?.categories ?? [];
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
      className="absolute left-0 md:left-auto top-full z-20 mt-3 w-full md:w-[700px] lg:w-[800px] rounded-2xl bg-dropdown backdrop-blur-xl p-6 shadow-2xl border-themed"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {categories.treeCategories?.map((e, i) => (
          <CategoryCha item={e} key={i} onClose={onClose} />
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-themed">
        <p className="text-center text-xs text-secondary/70">
          ⚡ Cập nhật liên tục • 🔒 Bảo mật tuyệt đối • 💎 Chất lượng cao
        </p>
      </div>
    </div>
  );
}
