// File: src/components/Client/layout/HomeLayout.jsx (Enhanced Responsive Version)
import React, { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/Client/layout/Header";
import Footer from "@components/Client/layout/Footer";
import { ClientThemeProvider } from "../../../contexts/ClientThemeContext";
import ChatContainer from "./ChatContainer";

export default function HomeLayout() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);

  // Enhanced scroll handling with direction detection and throttling
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Determine scroll direction
    if (currentScrollY > lastScrollY) {
      setScrollDirection("down");
    } else {
      setScrollDirection("up");
    }
    setLastScrollY(currentScrollY);

    // Show/hide scroll to top button
    setShowScrollTop(currentScrollY > 400);

    // Set scrolling state for animations
    setIsScrolling(true);

    // Clear scrolling state after scroll ends
    const timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [lastScrollY]);

  // Throttled scroll event listener
  useEffect(() => {
    let timeoutId;

    const throttledHandleScroll = () => {
      if (timeoutId) return;

      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 16); // ~60fps
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Enhanced scroll to top with smooth animation
  const scrollToTop = useCallback(() => {
    const scrollStep = window.scrollY / 15;

    const scrollAnimation = () => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, -scrollStep);
        requestAnimationFrame(scrollAnimation);
      }
    };

    // Use modern smooth scroll if available, fallback to custom animation
    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      requestAnimationFrame(scrollAnimation);
    }
  }, []);

  // Handle viewport height changes (mobile browser address bar)
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  // Keyboard handling for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle Escape key to close chats
      if (event.key === "Escape") {
        // This could trigger a custom event that ChatContainer listens to
        window.dispatchEvent(new CustomEvent("closeAllChats"));
      }

      // Handle Home/End keys for quick navigation
      if (event.key === "Home" && event.ctrlKey) {
        event.preventDefault();
        scrollToTop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToTop]);

  // Performance optimization: Reduce layout shifts
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // Delay layout rendering to prevent flash
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ClientThemeProvider>
      <div
        className={`bg-background min-h-screen transition-opacity duration-300 ${
          isLayoutReady ? "opacity-100" : "opacity-0"
        }`}
        style={{
          // Use CSS custom properties for dynamic viewport height
          minHeight: "calc(var(--vh, 1vh) * 100)",
        }}
      >
        {/* Enhanced Header with scroll state */}
        <Header isScrolling={isScrolling} scrollDirection={scrollDirection} />

        {/* Enhanced Main content with responsive container and proper spacing */}
        <main
          className={`pb-5 min-h-[calc(80vh)] max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 transition-all duration-300 ${
            isScrolling ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{
            minHeight: "calc(var(--vh, 1vh) * 80)",
          }}
        >
          {/* Skip link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-[9999]"
          >
            Bỏ qua đến nội dung chính
          </a>

          <div id="main-content">
            <Outlet />
          </div>
        </main>

        {/* Enhanced Footer with responsive design */}
        <Footer />

        {/* Enhanced Chat Container with all responsive improvements */}
        <ChatContainer
          showScrollTop={showScrollTop}
          scrollToTop={scrollToTop}
          isScrolling={isScrolling}
          scrollDirection={scrollDirection}
        />

        {/* Loading overlay for better UX during navigation */}
        {!isLayoutReady && (
          <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Enhanced SEO and performance meta tags */}
        <noscript>
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 text-center z-[9999]">
            JavaScript is required for the best experience on this website.
          </div>
        </noscript>
      </div>
    </ClientThemeProvider>
  );
}
