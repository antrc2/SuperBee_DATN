// File: src/components/Client/layout/HomeLayout.jsx (Sửa để dùng component mới)
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/Client/layout/Header";
import Footer from "@components/Client/layout/Footer";
import { ClientThemeProvider } from "../../../contexts/ClientThemeContext";
import ChatContainer from "./ChatContainer"; // Import component mới

export default function HomeLayout() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 400) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <ClientThemeProvider>
      <div className="bg-background">
        <Header />
        <main className="pb-5 min-h-[80svh] max-w-screen-xl mx-auto px-4">
          <Outlet />
        </main>
        <Footer />

        {/* Sử dụng component mới để chứa các chat */}
        <ChatContainer
          showScrollTop={showScrollTop}
          scrollToTop={scrollToTop}
        />
      </div>
    </ClientThemeProvider>
  );
}
