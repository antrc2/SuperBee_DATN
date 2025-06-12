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
      className="absolute left-0 md:left-auto top-full z-20 mt-2 w-full md:w-[700px] lg:w-[800px] rounded-md border bg-white p-4 shadow-lg"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-150"
            onClick={onClose} // Close dropdown on item click
          >
            <category.icon className="h-10 w-10 text-blue-600 mb-1" />
            <span className="text-center text-xs font-medium text-gray-700">
              {category.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
