import React from "react";

// Component Icon dấu tick để hiển thị trên màu đang được chọn
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3} // Làm cho nét đậm hơn
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

export function ThemeSwitcher({ themes, currentTheme, setTheme }) {
  return (
    <div className="flex items-center space-x-3 p-2">
      {themes.map((theme) => {
        // Xác định xem theme này có đang được chọn hay không
        const isActive = currentTheme === theme.id;

        // Xác định màu cho dấu tick (trắng trên nền tối, đen trên nền sáng)
        const tickColor = theme.id === "light" ? "text-black" : "text-white";

        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            // Tooltip để hiển thị tên màu khi người dùng hover
            title={theme.name}
            className={`
              w-7 h-7 
              rounded-full 
              flex items-center justify-center
              cursor-pointer 
              transition-all duration-200
              hover:scale-110
              border-2
              ${theme.colorClass} 
              ${
                isActive
                  ? "ring-2 ring-offset-2 ring-accent ring-offset-background"
                  : "border-transparent"
              }
            `}
            // Thuộc tính ARIA để cải thiện khả năng tiếp cận
            aria-label={`Chọn theme ${theme.name}`}
            aria-pressed={isActive}
          >
            {/* Chỉ hiển thị icon dấu tick nếu theme đang được chọn */}
            {isActive && <CheckIcon />}
          </button>
        );
      })}
    </div>
  );
}
