import React from "react";
import Header from "../../../components/Client/layout/Header";
import Sidebar from "../../../components/Client/profile/Sidebar";
import { Outlet } from "react-router-dom";
import { ClientThemeProvider } from "../../../contexts/ClientThemeContext";

export default function ProfileLayout() {
  return (
    <ClientThemeProvider>
      {/* Sử dụng class `bg-background` từ theme để đảm bảo toàn bộ trang có màu nền đúng */}
      <div className="bg-background min-h-screen ">
        <Header />
        <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto py-6 px-4 gap-6">
          <Sidebar />
          {/* Main content area */}
          <main className="flex-1">
            {/* - Bỏ thẻ div thừa bên trong. Outlet sẽ render trực tiếp nội dung các trang con.
              - Các trang con sẽ tự có thẻ <section> riêng để đồng nhất.
            */}
            <Outlet />
          </main>
        </div>
      </div>
    </ClientThemeProvider>
  );
}
