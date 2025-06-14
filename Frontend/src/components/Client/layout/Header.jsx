import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Bell,
  ShoppingCart,
  User,
  Menu as MenuIcon,
  X,
  Home,
  CreditCard,
  Gamepad2,
  Sparkles,
  Newspaper,
  ShoppingBag,
  Flame,
  DollarSign,
  Shield,
  Briefcase,
  Info,
  Lock,
  LogOut,
  History as HistoryIcon,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import SuperBeeLogo from "./SuperBeeLogo";
import CategoryDropdown from "./CategoryDropdown";
import NotificationDropdown from "./NotificationDropdown";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import { useCart } from "../../../contexts/CartContexts";

export default function Header() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth(); // Get user from AuthContext
  const { cartItems } = useCart();

  const isLogin = user != null; // Determine login status

  // State for mobile overlays
  const [mobileOverlayType, setMobileOverlayType] = useState(null); // 'notifications', 'cart', 'profile'

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileOverlayRef = useRef(null);

  const categoryMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const cartMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  // Mock data (keeping as is)
  const categories = [
    { name: "THU ACC THANH LÝ ALL", icon: ShoppingBag, href: "#" },
    { name: "ACC LIÊN QUÂN SALE", icon: Flame, href: "#" },
    { name: "ACC BLOX FRUITS GIÁ RẺ", icon: DollarSign, href: "#" },
    { name: "ACC FREE FIRE GIÁ RẺ", icon: Gamepad2, href: "#" },
    { name: "ACC FF BUFF GIÁ RẺ", icon: Sparkles, href: "#" },
    { name: "ACC VALORANT", icon: Shield, href: "#" },
  ];

  const notifications = [
    {
      id: 1,
      avatarUrl: "https://placehold.co/40x40/E2E8F0/4A5568?text=SB",
      message:
        "Chào mừng hè, Shop đang có chương trình vòng quay nhận miễn phí quân huy và kim cương.",
      timestamp: "12:23 24-07-2024",
    },
    {
      id: 2,
      avatarUrl: "https://placehold.co/40x40/E2E8F0/4A5568?text=SB",
      message: "Lỗ cái bồ",
      timestamp: "21:19 25-04-2024",
    },
  ];

  const navLinks = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Mua Acc", href: "/mua-acc", icon: Gamepad2, id: "nav-mua-acc" },
    { name: "Dịch vụ", href: "/services", icon: Briefcase, id: "nav-dich-vu" },
    { name: "Tin Tức", href: "/news", icon: Newspaper, id: "nav-tin-tuc" },
  ];

  // Universal toggle function for desktop dropdowns and mobile overlays
  const toggleDropdown = (type) => {
    const isMobile = window.innerWidth < 768; // md breakpoint

    switch (type) {
      case "category":
        setIsCategoryOpen((prev) => !prev);
        break;
      case "notification":
        if (isMobile) {
          setMobileOverlayType((prev) =>
            prev === "notifications" ? null : "notifications"
          );
          setIsNotificationOpen(false); // Ensure desktop dropdown is closed
        } else {
          setIsNotificationOpen((prev) => !prev);
          setMobileOverlayType(null); // Ensure mobile overlay is closed
        }
        break;
      case "user":
        if (isMobile) {
          setMobileOverlayType((prev) =>
            prev === "profile" ? null : "profile"
          );
          setIsUserMenuOpen(false); // Ensure desktop dropdown is closed
        } else {
          setIsUserMenuOpen((prev) => !prev);
          setMobileOverlayType(null); // Ensure mobile overlay is closed
        }
        break;
      case "cart":
        if (isMobile) {
          setMobileOverlayType((prev) => (prev === "cart" ? null : "cart"));
          setIsCartOpen(false); // Ensure desktop dropdown is closed
        } else {
          setIsCartOpen((prev) => !prev);
          setMobileOverlayType(null); // Ensure mobile overlay is closed
        }
        break;
      case "mobileMain":
        setIsMobileMenuOpen((prev) => !prev);
        break;
      default:
        break;
    }
  };

  // Close all specific dropdowns/overlays
  const closeAllDropdowns = () => {
    setIsCategoryOpen(false);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
    setIsCartOpen(false);
    setMobileOverlayType(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng dropdown Danh mục nếu click ra ngoài
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }

      // Đóng dropdown Thông báo nếu click ra ngoài
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }

      // Đóng dropdown Giỏ hàng nếu click ra ngoài
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }

      // Đóng dropdown User nếu click ra ngoài
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      // Logic cho mobile main menu (hamburger) - giữ nguyên
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("#mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }

      // Logic cho mobile overlays (backdrop click) - giữ nguyên
      if (
        mobileOverlayRef.current &&
        !mobileOverlayRef.current.contains(event.target) &&
        event.target.closest(".mobile-overlay-trigger") === null
      ) {
        setMobileOverlayType(null);
      }

      // Logic thu gọn thanh tìm kiếm - giữ nguyên
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        isSearchExpanded
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded]);
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setMobileOverlayType(null); // Close any open mobile overlays
  };

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Section: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              id="mobile-menu-button"
              onClick={() => toggleDropdown("mobileMain")}
              className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
            <a href="/" className="flex items-center">
              <SuperBeeLogo />
            </a>
          </div>

          {/* Center Section (Desktop): Navigation & Category Dropdown OR Expanded Search */}
          <div
            ref={searchContainerRef}
            className="hidden md:flex flex-grow items-center justify-center relative"
          >
            {!isSearchExpanded && (
              <nav className="flex items-center gap-1 lg:gap-2">
                <div ref={categoryMenuRef} className="relative">
                  <button
                    onClick={() => toggleDropdown("category")}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    <MenuIcon size={18} className="text-blue-600" />
                    <span>Danh mục</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isCategoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <CategoryDropdown
                    categories={categories}
                    isOpen={isCategoryOpen}
                    onClose={() => setIsCategoryOpen(false)}
                  />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            )}

            {/* Search Bar - Desktop */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
                isSearchExpanded ? "w-full max-w-lg" : "w-auto"
              }`}
            >
              {isSearchExpanded ? (
                <div className="relative w-full group">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-5 pr-12 text-sm shadow-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 group-hover:border-blue-400"
                    onBlur={() => {
                      /* Consider if onBlur is too aggressive, or manage state with a debounce */
                    }}
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors">
                    <Search size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchIconClick}
                  className="ml-4 p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  aria-label="Mở tìm kiếm"
                >
                  <Search size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/recharge-atm"
              className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-white shadow-md hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              <CreditCard size={18} />
              <span className="hidden lg:inline">Nạp Tiền</span>
            </Link>
            <div ref={notificationMenuRef} className="relative">
              <button
                onClick={() => toggleDropdown("notification")}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors mobile-overlay-trigger"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              <NotificationDropdown
                notifications={notifications}
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>
            <div ref={cartMenuRef} className="relative">
              <button
                onClick={() => toggleDropdown("cart")}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors mobile-overlay-trigger"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <CartDropdown
                cartItems={cartItems}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
              />
            </div>

            {isLogin ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center gap-2 rounded-full p-1 text-gray-600 hover:bg-gray-100 transition-colors mobile-overlay-trigger"
                  aria-label="User menu"
                >
                  <img
                    src="https://placehold.co/36x36/E2E8F0/4A5568?text=U"
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/36x36/E2E8F0/4A5568?text=Err";
                    }}
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-gray-800">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Số dư: {user?.money || "0"}đ
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`hidden lg:block transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <UserMenu
                  user={user}
                  isOpen={isUserMenuOpen}
                  onClose={() => setIsUserMenuOpen(false)}
                />
              </div>
            ) : (
              <div className="ml-5">
                <Link to="/auth/login">
                  <User
                    size={22}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Main Menu (Hamburger) */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-16 left-0 right-0 z-40 bg-white border-t shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-3 space-y-3">
              <div className="relative w-full group mb-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-5 pr-12 text-sm shadow-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 group-hover:border-blue-400"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors">
                  <Search size={18} />
                </button>
              </div>
              <Link
                to="/recharge-atm"
                onClick={handleMobileLinkClick}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
              >
                <CreditCard size={18} />
                Nạp Tiền Ngay
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handleMobileLinkClick}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  <link.icon size={20} className="text-gray-500" />
                  {link.name}
                </Link>
              ))}
              <div className="border-t pt-3 mt-3">
                <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase mb-2">
                  Danh mục sản phẩm
                </h3>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    onClick={handleMobileLinkClick}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                  >
                    <category.icon size={20} className="text-gray-500" />
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Overlays for Notifications, Cart, Profile */}
        {mobileOverlayType && (
          <div
            className="md:hidden fixed inset-0 z-40 flex justify-end"
            onClick={(e) => {
              if (
                mobileOverlayRef.current &&
                !mobileOverlayRef.current.contains(e.target) &&
                !e.target.closest(".mobile-overlay-trigger")
              ) {
                setMobileOverlayType(null);
              }
            }}
          >
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
            ></div>
            <div
              ref={mobileOverlayRef}
              className="relative z-50 bg-white w-4/5 max-w-sm h-full shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0"
            >
              {mobileOverlayType === "notifications" && (
                <NotificationDropdown
                  notifications={notifications}
                  isOpen={true} // Always open when mobileOverlayType is 'notifications'
                  onClose={() => setMobileOverlayType(null)}
                  isMobile={true}
                />
              )}
              {mobileOverlayType === "cart" && (
                <CartDropdown
                  cartItems={cartItems}
                  isOpen={true} // Always open when mobileOverlayType is 'cart'
                  onClose={() => setMobileOverlayType(null)}
                  isMobile={true}
                />
              )}
              {mobileOverlayType === "profile" && (
                <UserMenu
                  user={user}
                  isOpen={true} // Always open when mobileOverlayType is 'profile'
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
