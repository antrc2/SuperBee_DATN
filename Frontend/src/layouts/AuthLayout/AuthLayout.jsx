// src/layouts/AuthLayout.jsx

import { Outlet } from "react-router-dom";
import chi from "@assets/tn/chitos.gif"; // Điều chỉnh đường dẫn nếu cần
import { useClientTheme } from "../../contexts/ClientThemeContext";

export default function AuthLayout() {
  const { theme, setTheme } = useClientTheme();
  return (
    <div className="serene-dawn">
      <div className="relative flex min-h-screen w-full flex-col justify-center lg:flex-row">
        {/* Phần bên trái chứa Form, chiếm 1/2 màn hình trên desktop */}
        <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2">
          {/* Outlet sẽ render component con, ví dụ như LoginForm */}
          <Outlet />
        </div>

        {/* Phần bên phải chứa ảnh, chỉ hiển thị trên desktop
        <div className="relative hidden items-center justify-center lg:flex lg:w-1/2">
          <img
            src={chi}
            alt="Chitoge Kirisaki"
            className="h-full max-h-screen w-full object-contain"
            loading="eager"
          />
        </div> */}
      </div>
    </div>
  );
}
