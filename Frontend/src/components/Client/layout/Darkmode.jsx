import { useClientTheme } from "../../../contexts/ClientThemeContext";
import { ThemeSwitcher } from "../../common/ThemeSwitcher";

const availableThemes = [
  {
    id: "light",
    name: "Sáng",
    colorClass: "bg-gray-100 border-gray-300",
  },
  {
    id: "dark",
    name: "Tối",
    colorClass: "bg-gray-800",
  },
  {
    id: "theme-pink",
    name: "Hồng",
    colorClass: "bg-pink-400",
  },
];

// Thêm prop 'isOpen' để điều khiển hiển thị
export default function DarkMode({ isOpen }) {
  const { theme, setTheme } = useClientTheme();

  return (
    // Dùng absolute để định vị popup, và điều khiển hiển thị bằng class
    <div
      className={`
        absolute top-full right-0 mt-3 w-max origin-top-right 
        rounded-xl bg-dropdown shadow-2xl border border-themed 
        p-4 transition-all duration-200 z-9999
        ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }
      `}
    >
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary px-2">Giao diện</h3>
        <ThemeSwitcher
          themes={availableThemes}
          currentTheme={theme}
          setTheme={setTheme}
        />
      </div>
    </div>
  );
}
