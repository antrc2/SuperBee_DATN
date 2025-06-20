"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Bell,
  ShoppingCart,
  User,
  MenuIcon,
  X,
  Home,
  CreditCard,
  Gamepad2,
  Sparkles,
  Newspaper,
  Flame,
  Shield,
  Briefcase,
  Zap,
  Star,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import SuperBeeLogo from "./SuperBeeLogo";
import CategoryDropdown from "./CategoryDropdown";
import NotificationDropdown from "./NotificationDropdown";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import { useCart } from "../../../contexts/CartContexts";
export default function Header() {
  // State management
  const [dropdownStates, setDropdownStates] = useState({
    category: false,
    notification: false,
    user: false,
    cart: false,
    mobileMenu: false,
    searchExpanded: false,
  });

  const [mobileOverlayType, setMobileOverlayType] = useState(null);

  const { user } = useAuth();
  const { cartItems } = useCart();
  const isLogin = user != null;

  // Refs
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileOverlayRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const cartMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Enhanced categories with color variables
  const categories = [
    {
      name: "🔥 ACC HOT SALE",
      icon: Flame,
      href: "#",
      gradient: "from-red-500 to-orange-500",
    },
    {
      name: "⚡ LIÊN QUÂN VIP",
      icon: Zap,
      href: "#",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      name: "💎 BLOX FRUITS RARE",
      icon: Sparkles,
      href: "#",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      name: "🎮 FREE FIRE PRO",
      icon: Gamepad2,
      href: "#",
      gradient: "from-green-400 to-blue-500",
    },
    {
      name: "🌟 VALORANT ELITE",
      icon: Star,
      href: "#",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "🛡️ ACC PREMIUM",
      icon: Shield,
      href: "#",
      gradient: "from-indigo-500 to-purple-600",
    },
  ];

  const notifications = [
    {
      id: 1,
      avatarUrl: "https://placehold.co/40x40/667eea/ffffff?text=🎮",
      message:
        "🎉 MEGA SALE! Giảm giá 50% tất cả acc Liên Quân Mobile. Cơ hội vàng không thể bỏ lỡ!",
      timestamp: "2 phút trước",
      type: "promotion",
    },
    {
      id: 2,
      avatarUrl: "https://placehold.co/40x40/f093fb/ffffff?text=⚡",
      message: "⚡ Vừa cập nhật 100+ acc Free Fire rank Heroic giá siêu rẻ!",
      timestamp: "15 phút trước",
      type: "update",
    },
  ];

  const navLinks = [
    { name: " Trang chủ", href: "/", icon: Home },
    { name: " Mua Acc", href: "/mua-acc", icon: Gamepad2 },
    { name: " Dịch vụ", href: "/services", icon: Briefcase },
    { name: " Tin Tức", href: "/news", icon: Newspaper },
  ];

  // Fixed toggle function with proper state management
  const toggleDropdown = useCallback((type, forceClose = false) => {
    const isMobile = window.innerWidth < 768;

    // Close all dropdowns first
    setDropdownStates((prev) => ({
      ...prev,
      category: false,
      notification: false,
      user: false,
      cart: false,
      searchExpanded: false,
    }));

    setMobileOverlayType(null);

    // If forceClose is true, just close everything
    if (forceClose) return;

    // Then open the requested dropdown
    setTimeout(() => {
      switch (type) {
        case "category":
          setDropdownStates((prev) => ({ ...prev, category: true }));
          break;
        case "notification":
          if (isMobile) {
            setMobileOverlayType("notifications");
          } else {
            setDropdownStates((prev) => ({ ...prev, notification: true }));
          }
          break;
        case "user":
          if (isMobile) {
            setMobileOverlayType("profile");
          } else {
            setDropdownStates((prev) => ({ ...prev, user: true }));
          }
          break;
        case "cart":
          if (isMobile) {
            setMobileOverlayType("cart");
          } else {
            setDropdownStates((prev) => ({ ...prev, cart: true }));
          }
          break;
        case "mobileMain":
          setDropdownStates((prev) => ({
            ...prev,
            mobileMenu: !prev.mobileMenu,
          }));
          break;
        case "search":
          setDropdownStates((prev) => ({ ...prev, searchExpanded: true }));
          break;
        default:
          break;
      }
    }, 10);
  }, []);

  // Close dropdown function
  const closeDropdown = useCallback((type) => {
    switch (type) {
      case "category":
        setDropdownStates((prev) => ({ ...prev, category: false }));
        break;
      case "notification":
        setDropdownStates((prev) => ({ ...prev, notification: false }));
        break;
      case "user":
        setDropdownStates((prev) => ({ ...prev, user: false }));
        break;
      case "cart":
        setDropdownStates((prev) => ({ ...prev, cart: false }));
        break;
      case "mobileOverlay":
        setMobileOverlayType(null);
        break;
      case "search":
        setDropdownStates((prev) => ({ ...prev, searchExpanded: false }));
        break;
      default:
        break;
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Category dropdown
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      ) {
        closeDropdown("category");
      }

      // Notification dropdown
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        closeDropdown("notification");
      }

      // Cart dropdown
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target)) {
        closeDropdown("cart");
      }

      // User dropdown
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeDropdown("user");
      }

      // Mobile menu
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("#mobile-menu-button")
      ) {
        setDropdownStates((prev) => ({ ...prev, mobileMenu: false }));
      }

      // Mobile overlay
      if (
        mobileOverlayRef.current &&
        !mobileOverlayRef.current.contains(event.target) &&
        !event.target.closest(".mobile-overlay-trigger")
      ) {
        setMobileOverlayType(null);
      }

      // Search
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        dropdownStates.searchExpanded
      ) {
        closeDropdown("search");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownStates.searchExpanded, closeDropdown]);

  // Focus search input when expanded
  useEffect(() => {
    if (dropdownStates.searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [dropdownStates.searchExpanded]);

  const handleMobileLinkClick = () => {
    setDropdownStates((prev) => ({ ...prev, mobileMenu: false }));
    setMobileOverlayType(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-gradient-header shadow-2xl">
        {/* Animated background pattern */}
        <div className='absolute inset-0 bg-[url(&apos;data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Cg fill="%23bf00ff" fillOpacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&apos;)] animate-pulse'></div>

        {/* TOP ROW - Logo, Search, Actions */}
        <div className="relative border-b border-[var(--color-secondary-500)]/20">
          <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                id="mobile-menu-button"
                onClick={() => toggleDropdown("mobileMain")}
                className="md:hidden rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-sm"
                aria-label="Toggle mobile menu"
              >
                {dropdownStates.mobileMenu ? (
                  <X size={24} />
                ) : (
                  <MenuIcon size={24} />
                )}
              </button>
              <a href="/" className="flex items-center">
                <SuperBeeLogo />
              </a>
            </div>

            {/* Center: Search Bar */}
            <div
              ref={searchContainerRef}
              className="hidden md:flex flex-grow items-center justify-center max-w-2xl mx-8"
            >
              <div className="relative w-full group">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="🔍 Tìm kiếm acc game, dịch vụ, tin tức..."
                  className="w-full rounded-full border-2 border-[var(--color-secondary-500)]/30 bg-black/20 backdrop-blur-md py-3.5 pl-6 pr-14 text-sm text-white placeholder-white/60 shadow-lg outline-none transition-all duration-300 focus:border-[var(--color-neon-cyan)] focus:ring-2 focus:ring-[var(--color-neon-cyan)]/50 hover:border-[var(--color-secondary-400)]/50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-button p-2.5 text-white hover:scale-105 transition-all duration-300 shadow-lg glow-neon-blue">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/recharge-atm"
                className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-warning px-4 py-2.5 lg:px-5 lg:py-3 text-sm font-bold text-white shadow-lg hover:shadow-orange-400/25 transition-all duration-300 transform hover:scale-105"
              >
                <CreditCard size={18} />
                <span className="hidden lg:inline"> Nạp Tiền</span>
              </Link>

              {/* Notification */}
              <div ref={notificationMenuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dropdownStates.notification) {
                      closeDropdown("notification");
                    } else {
                      toggleDropdown("notification");
                    }
                  }}
                  className="relative rounded-full p-2.5 text-white/80 hover:bg-gradient-to-r hover:from-[var(--color-secondary-600)]/20 hover:to-[var(--color-accent-pink)]/20 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-secondary-400)]/50 mobile-overlay-trigger"
                  aria-label="Notifications"
                >
                  <Bell size={22} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-danger text-xs text-white font-bold animate-pulse shadow-lg">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  notifications={notifications}
                  isOpen={dropdownStates.notification}
                  onClose={() => closeDropdown("notification")}
                />
              </div>

              {/* Cart */}
              <div ref={cartMenuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dropdownStates.cart) {
                      closeDropdown("cart");
                    } else {
                      toggleDropdown("cart");
                    }
                  }}
                  className="relative rounded-full p-2.5 text-white/80 hover:bg-gradient-to-r hover:from-[var(--color-primary-600)]/20 hover:to-[var(--color-neon-cyan)]/20 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-neon-cyan)]/50 mobile-overlay-trigger"
                  aria-label="Cart"
                >
                  <ShoppingCart size={22} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-success text-xs text-white font-bold animate-bounce shadow-lg">
                      {cartItems.length}
                    </span>
                  )}
                </button>
                <CartDropdown
                  cartItems={cartItems}
                  isOpen={dropdownStates.cart}
                  onClose={() => closeDropdown("cart")}
                />
              </div>

              {/* User Menu */}
              {isLogin ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dropdownStates.user) {
                        closeDropdown("user");
                      } else {
                        toggleDropdown("user");
                      }
                    }}
                    className="flex items-center gap-2 rounded-full p-1.5 text-white/90 hover:bg-gradient-to-r hover:from-[var(--color-secondary-600)]/20 hover:to-[var(--color-accent-pink)]/20 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-secondary-400)]/50 mobile-overlay-trigger"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <img
                        src={user?.avatar}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full object-cover border-2 border-[var(--color-secondary-400)]/50"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--color-accent-green)] rounded-full border-2 border-[var(--color-dark-surface)]"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-white">
                        {user?.name || "Gamer"}
                      </p>
                      <p className="text-xs text-neon-blue font-medium">
                        💰 {user?.money || "0"}đ
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`hidden lg:block transition-transform duration-300 ${
                        dropdownStates.user ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <UserMenu
                    user={user}
                    isOpen={dropdownStates.user}
                    onClose={() => closeDropdown("user")}
                  />
                </div>
              ) : (
                <Link to="/auth/login" className="ml-2">
                  <div className="rounded-full p-2.5 text-white/80 hover:bg-gradient-to-r hover:from-[var(--color-secondary-600)]/20 hover:to-[var(--color-accent-pink)]/20 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-secondary-400)]/50">
                    <User size={22} />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW - Navigation Menu */}
        <div className="relative">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              {/* Left: Category Dropdown */}
              <div ref={categoryMenuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dropdownStates.category) {
                      closeDropdown("category");
                    } else {
                      toggleDropdown("category");
                    }
                  }}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-gradient-to-r hover:from-[var(--color-secondary-600)]/20 hover:to-[var(--color-accent-pink)]/20 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-secondary-400)]/50"
                >
                  <MenuIcon size={18} className="text-neon-blue" />
                  <span className="font-semibold"> Danh mục game</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      dropdownStates.category ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <CategoryDropdown
                  categories={categories}
                  isOpen={dropdownStates.category}
                  onClose={() => closeDropdown("category")}
                />
              </div>

              {/* Center: Main Navigation */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="relative rounded-lg px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-button opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                    <span className="relative flex items-center gap-2">
                      <link.icon size={16} />
                      {link.name}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Right: Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <div className="w-2 h-2 bg-[var(--color-accent-green)] rounded-full animate-pulse"></div>
                  <span>Online: 1,234</span>
                </div>
                <div className="h-4 w-px bg-white/20 mx-2"></div>
                <div className="text-xs text-neon-blue font-medium">
                  🔥 Hot Sale: -50%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden border-t border-[var(--color-secondary-500)]/20 p-3">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="🔍 Tìm acc game..."
              className="w-full rounded-full border-2 border-[var(--color-secondary-500)]/30 bg-black/20 backdrop-blur-md py-3 pl-6 pr-14 text-sm text-white placeholder-white/60 shadow-lg outline-none transition-all duration-300 focus:border-[var(--color-neon-cyan)] focus:ring-2 focus:ring-[var(--color-neon-cyan)]/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-button p-2.5 text-white">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Main Menu */}
        {dropdownStates.mobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 z-40 bg-gradient-dark backdrop-blur-xl border-t border-[var(--color-secondary-500)]/20 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Recharge Button */}
              <Link
                to="/recharge-atm"
                onClick={handleMobileLinkClick}
                className="flex items-center justify-center gap-3 w-full rounded-xl bg-gradient-warning px-4 py-4 text-sm font-bold text-white shadow-lg hover:shadow-orange-400/25 transition-all duration-300"
              >
                <CreditCard size={20} />
                Nạp Tiền Ngay
              </Link>

              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handleMobileLinkClick}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium text-white/90 hover:bg-gradient-to-r hover:from-[var(--color-secondary-600)]/20 hover:to-[var(--color-accent-pink)]/20 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-secondary-400)]/50"
                >
                  <link.icon size={22} className="text-neon-blue" />
                  {link.name}
                </Link>
              ))}

              {/* Categories Section */}
              <div className="border-t border-[var(--color-secondary-500)]/20 pt-4 mt-4">
                <h3 className="px-4 text-sm font-bold text-neon-blue uppercase mb-3 tracking-wider">
                  Danh mục hot
                </h3>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    onClick={handleMobileLinkClick}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium text-white/90 hover:bg-gradient-to-r hover:from-[var(--color-secondary-600)]/20 hover:to-[var(--color-accent-pink)]/20 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[var(--color-secondary-400)]/50 mb-2"
                  >
                    <category.icon size={22} className="text-neon-purple" />
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Overlays */}
        {mobileOverlayType && (
          <div className="md:hidden fixed inset-0 z-40 flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"></div>
            <div
              ref={mobileOverlayRef}
              className="relative z-50 bg-gradient-dark backdrop-blur-xl w-4/5 max-w-sm h-full shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 border-l border-[var(--color-secondary-500)]/20"
            >
              {mobileOverlayType === "notifications" && (
                <NotificationDropdown
                  notifications={notifications}
                  isOpen={true}
                  onClose={() => setMobileOverlayType(null)}
                  isMobile={true}
                />
              )}
              {mobileOverlayType === "cart" && (
                <CartDropdown
                  cartItems={cartItems}
                  isOpen={true}
                  onClose={() => setMobileOverlayType(null)}
                  isMobile={true}
                />
              )}
              {mobileOverlayType === "profile" && (
                <UserMenu
                  user={user}
                  isOpen={true}
                  onClose={() => setMobileOverlayType(null)}
                  isMobile={true}
                />
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
