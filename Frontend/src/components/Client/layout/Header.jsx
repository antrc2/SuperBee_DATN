"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Bell,
  ShoppingCart,
  User,
  MenuIcon,
  X,
  Home,
  CreditCard,
  Gamepad2,
  Briefcase,
  Palette,
  Newspaper,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import SuperBeeLogo from "./SuperBeeLogo";
import CategoryDropdown from "./CategoryDropdown";
import NotificationDropdown from "./NotificationDropdown";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import { useCart } from "../../../contexts/CartContext";
import { useHome } from "../../../contexts/HomeContext";
import SearchBar from "./Search";
import { formatCurrencyVND } from "../../../utils/hook";
import DarkMode from "./Darkmode";

export default function Header() {
  // State management
  const [dropdownStates, setDropdownStates] = useState({
    category: false,
    notification: false,
    user: false,
    cart: false,
    theme: false,
    mobileMenu: false,
  });

  const [mobileOverlayType, setMobileOverlayType] = useState(null);

  const { user } = useAuth();
  const { cartItems } = useCart();
  const { notifications } = useHome();
  const { homeData } = useHome();
  const categories = homeData?.data?.categories ?? [];
  const isLogin = user != null;

  // Refs
  const mobileMenuRef = useRef(null);
  const mobileOverlayRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const cartMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  const navLinks = [
    { name: " Trang chủ", href: "/", icon: Home },
    { name: " Mua Acc", href: "/mua-acc", icon: Gamepad2 },
    { name: " Dịch vụ", href: "/services", icon: Briefcase },
    { name: " Tin Tức", href: "/tin-tuc", icon: Newspaper },
  ];

  const toggleDropdown = useCallback(
    (type) => {
      const isMobile = window.innerWidth < 768;
      const currentlyOpen = dropdownStates[type];

      // Close all dropdowns first
      setDropdownStates({
        category: false,
        notification: false,
        user: false,
        cart: false,
        theme: false,
        mobileMenu: dropdownStates.mobileMenu, // Preserve mobile menu state
      });
      setMobileOverlayType(null);

      // If the dropdown was not already open, open it
      if (!currentlyOpen) {
        setTimeout(() => {
          switch (type) {
            case "category":
              setDropdownStates((prev) => ({ ...prev, category: true }));
              break;
            case "notification":
              if (isMobile) setMobileOverlayType("notifications");
              else
                setDropdownStates((prev) => ({ ...prev, notification: true }));
              break;
            case "user":
              if (isMobile) setMobileOverlayType("profile");
              else setDropdownStates((prev) => ({ ...prev, user: true }));
              break;
            case "cart":
              if (isMobile) setMobileOverlayType("cart");
              else setDropdownStates((prev) => ({ ...prev, cart: true }));
              break;
            case "theme":
              setDropdownStates((prev) => ({ ...prev, theme: true }));
              break;
          }
        }, 10);
      }
    },
    [dropdownStates]
  );

  const closeDropdown = useCallback((type) => {
    setDropdownStates((prev) => ({ ...prev, [type]: false }));
  }, []);

  const handleMobileLinkClick = () => {
    setDropdownStates((prev) => ({ ...prev, mobileMenu: false }));
    setMobileOverlayType(null);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      )
        closeDropdown("category");
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      )
        closeDropdown("notification");
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target))
        closeDropdown("cart");
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target))
        closeDropdown("theme");
      if (userMenuRef.current && !userMenuRef.current.contains(event.target))
        closeDropdown("user");
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("#mobile-menu-button")
      )
        setDropdownStates((prev) => ({ ...prev, mobileMenu: false }));
      if (
        mobileOverlayRef.current &&
        !mobileOverlayRef.current.contains(event.target) &&
        !event.target.closest(".mobile-overlay-trigger")
      )
        setMobileOverlayType(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  return (
    <>
      <header className="sticky -top-[64px] z-50 w-full bg-gradient-header shadow-2xl body-decorated">
        {/* TOP ROW - Logo, Search, Actions */}
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center">
              <SuperBeeLogo />
            </a>
          </div>

          <div className="hidden md:flex flex-grow items-center justify-center max-w-2xl mx-8">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/recharge-atm"
              className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-warning px-4 py-2.5 lg:px-5 lg:py-3 text-sm font-bold text-accent-contrast shadow-lg hover:shadow-orange-400/25 transition-all duration-300 transform hover:scale-105 border-hover"
            >
              <CreditCard size={18} />
              <span className="hidden lg:inline"> Nạp Tiền</span>
            </Link>

            <div ref={notificationMenuRef} className="relative">
              <button
                onClick={() => toggleDropdown("notification")}
                className="relative rounded-full p-2.5 text-primary/80 border-hover transition-all duration-300 backdrop-blur-sm mobile-overlay-trigger"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {notifications.count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-danger text-xs text-white font-bold animate-pulse shadow-lg">
                    {notifications.count}
                  </span>
                )}
              </button>
              <NotificationDropdown
                notifications={notifications}
                isOpen={dropdownStates.notification}
                onClose={() => closeDropdown("notification")}
              />
            </div>

            <div ref={cartMenuRef} className="relative">
              <button
                onClick={() => toggleDropdown("cart")}
                className="relative rounded-full p-2.5 text-primary/80 border-hover transition-all duration-300 backdrop-blur-sm mobile-overlay-trigger"
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
            <div ref={themeMenuRef} className="relative">
              <button
                onClick={() => toggleDropdown("theme")}
                className="relative rounded-full p-2.5 text-primary/80 border-hover transition-all duration-300 backdrop-blur-sm"
                aria-label="Chọn giao diện"
              >
                <Palette size={22} />
              </button>
              <DarkMode isOpen={dropdownStates.theme} />
            </div>
            {isLogin ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center gap-2 rounded-full p-1.5 border-hover transition-all duration-300 backdrop-blur-sm mobile-overlay-trigger"
                  aria-label="User menu"
                >
                  <img
                    src={user?.avatar}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover border-2 border-accent"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-primary">
                      {user?.name || "Gamer"}
                    </p>
                    <p className="text-xs text-highlight font-medium">
                      {formatCurrencyVND(user?.money) || "0"} VND
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`hidden lg:block text-primary transition-transform duration-300 ${
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
                <div className="rounded-full p-2.5 border-hover text-primary transition-all duration-300 backdrop-blur-sm ">
                  <User size={22} />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* BOTTOM ROW - Navigation Menu */}
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="hidden md:flex h-14 items-center justify-between">
            <div ref={categoryMenuRef} className="relative">
              <button
                onClick={() => toggleDropdown("category")}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-primary border-hover transition-all duration-300 backdrop-blur-sm"
              >
                <MenuIcon size={18} className="text-highlight" />
                <span className="font-semibold"> Danh mục game</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    dropdownStates.category ? "rotate-180" : ""
                  }`}
                />
              </button>
              <CategoryDropdown
                isOpen={dropdownStates.category}
                onClose={() => closeDropdown("category")}
              />
            </div>

            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative rounded-lg px-4 py-2.5 text-sm font-medium text-secondary hover:text-primary transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-button opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                  <span className="relative flex items-center gap-2">
                    <link.icon size={16} />
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Search & Menu Button */}
        <div className="md:hidden px-4 py-3 flex gap-4 items-center">
          <button
            id="mobile-menu-button"
            onClick={() =>
              setDropdownStates((p) => ({ ...p, mobileMenu: !p.mobileMenu }))
            }
            className="rounded-lg p-2 text-primary/80 transition-all duration-300  border-hover"
          >
            {dropdownStates.mobileMenu ? (
              <X size={24} />
            ) : (
              <MenuIcon size={24} />
            )}
          </button>
          <div className="relative w-full">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Main Menu */}
        {dropdownStates.mobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 z-40 bg-gradient-header backdrop-blur-xl border-t border-themed shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/recharge-atm"
                onClick={handleMobileLinkClick}
                className="flex items-center justify-center gap-3 w-full rounded-xl bg-gradient-warning px-4 py-4 text-sm font-bold text-accent-contrast shadow-lg"
              >
                <CreditCard size={20} />
                Nạp Tiền Ngay
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handleMobileLinkClick}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium text-secondary hover:text-primary transition-all duration-300 border-hover"
                >
                  <link.icon size={22} className="text-highlight" />
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-themed pt-4 mt-4">
                <h3 className="px-4 text-sm font-bold text-highlight uppercase mb-3 tracking-wider">
                  Danh mục hot
                </h3>
                {categories?.treeCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={`mua-acc/${category.slug}`}
                    onClick={handleMobileLinkClick}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium text-secondary hover:text-primary transition-all duration-300 border-hover mb-2"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Overlays */}
        {mobileOverlayType && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleMobileLinkClick}
            ></div>
            <div
              ref={mobileOverlayRef}
              className="relative z-50 bg-gradient-header w-4/5 max-w-sm h-full shadow-2xl border-l border-themed"
            >
              {mobileOverlayType === "notifications" && (
                <NotificationDropdown
                  notifications={notifications}
                  isOpen={true}
                  onClose={handleMobileLinkClick}
                  isMobile={true}
                />
              )}
              {mobileOverlayType === "cart" && (
                <CartDropdown
                  cartItems={cartItems}
                  isOpen={true}
                  onClose={handleMobileLinkClick}
                  isMobile={true}
                />
              )}
              {mobileOverlayType === "profile" && (
                <UserMenu
                  user={user}
                  isOpen={true}
                  onClose={handleMobileLinkClick}
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
