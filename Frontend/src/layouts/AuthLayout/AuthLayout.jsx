import React, { useState, useEffect } from "react";
import GridShape from "@components/Admin/common/GridShape";
import { Link, Outlet } from "react-router";
import ThemeTogglerTwo from "@components/Admin/common/ThemeTogglerTwo";
import chi from "@assets/tn/chitos.png";

export default function AuthLayout() {
  const textToType = "Chào Bạn Yêu";
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false); // Thêm state này

  useEffect(() => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < textToType.length) {
        setDisplayedText((prev) => prev + textToType.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTypingComplete(true); // Đặt là true khi gõ xong
      }
    }, 150); // Tốc độ xuất hiện từng chữ cái (miligiây)

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 object-fit-contain serene-dawn">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        <Outlet />

        <div className="relative items-center hidden w-full h-full lg:w-1/2 lg:grid">
          <img
            src={chi}
            alt="Chitoge"
            className="w-full h-full object-contain overflow-hidden " // Hoặc object-cover
          />
          <div className=" flex items-center justify-center z-1">
            {/* Lớp phủ (giữ nguyên hoặc bỏ nếu không cần) */}
            {/* <div className="absolute inset-0 bg-blue-500 opacity-20"></div>{" "} */}

            {/* Lớp chữ xuất hiện lại */}
            <div
              className={`absolute top-1/3 -left-1/4 translate-y-16 transform text-6xl font-extrabold font-outline-2 ${
                typingComplete ? "animate-fade-in-out" : "" // Áp dụng animation mới
              }`}
              style={{
                color: "magenta", // Đổi màu chữ sang magenta (màu hồng tím sáng)
                textShadow:
                  "3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 0, 255, 0.7)", // Đổ bóng đậm hơn và thêm glow
                letterSpacing: "2px", // Khoảng cách giữa các chữ cái
              }}
            >
              {displayedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
