// src/components/Layout/AppLayout.jsx

import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@contexts/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

// Component con để truy cập context
const LayoutContent = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative min-h-screen">
        {" "}
        {/* Bỏ xl:flex vì sidebar giờ đây là fixed */}
        <AppSidebar />
        <Backdrop />
        <main
          className={`
            absolute top-0 right-0 w-full transition-all duration-300 ease-in-out
            // --- THAY ĐỔI CHÍNH ---
            // Điều chỉnh width của main content thay vì dùng margin.
            // Khi sidebar mở rộng, width của main sẽ là 100% - 288px (w-72)
            // Khi sidebar thu gọn, width của main sẽ là 100% - 96px (w-24)
            ${isExpanded ? "lg:w-[calc(100%-18rem)]" : "lg:w-[calc(100%-6rem)]"}
            // Trên mobile, luôn là 100%
            w-full
          `}
        >
          <AppHeader />
          <div className="p-4 mx-auto max-w-7xl md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// Component chính
const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
