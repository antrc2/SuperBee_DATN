// src/layouts/AuthLayout.jsx

import { Outlet } from "react-router-dom";
import chi from "@assets/tn/chitos.png"; // Điều chỉnh đường dẫn nếu cần
import ThemeTogglerTwo from "@components/Admin/common/ThemeTogglerTwo";
export default function AuthLayout() {
  return (
    // Thẻ body hoặc html là nơi bạn sẽ thêm data-theme="light" để đổi chế độ
    <div className="serene-dawn">
      <div className="relative flex min-h-screen w-full flex-col justify-center lg:flex-row">
        {/* Phần bên trái chứa Form, chiếm 1/2 màn hình trên desktop */}
        <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2">
          {/* Outlet sẽ render component con, ví dụ như LoginForm */}
          <Outlet />
        </div>

        {/* Phần bên phải chứa ảnh, chỉ hiển thị trên desktop */}
        <div className="relative hidden items-center justify-center lg:flex lg:w-1/2">
          <img
            src={chi}
            alt="Chitoge Kirisaki"
            className="h-full max-h-screen w-full object-contain"
            loading="eager"
          />
        </div>
      </div>
      <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
