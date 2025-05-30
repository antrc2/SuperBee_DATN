import { useEffect, useState, useRef } from "react";
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
  ShoppingBag, // Generic for "THU ACC THANH LÝ ALL"
  Flame, // Generic for "ACC LIÊN QUÂN SALE" / "ACC FREE FIRE GIÁ RẺ"
  DollarSign, // Generic for "ACC BLOX FRUITS GIÁ RẺ"
  Shield, // Generic for "ACC VALORANT"
  Briefcase, // Generic for "Dịch vụ"
  Info,
  Lock,
  LogOut,
  History as HistoryIcon
} from "lucide-react";

// SuperBee SVG Logo Component
const SuperBeeLogo = () => (
  // <svg
  //   width="150"
  //   height="40"
  //   viewBox="0 0 150 40"
  //   fill="none"
  //   xmlns="http://www.w3.org/2000/svg"
  //   className="h-10 w-auto"
  // >
  //   <path
  //     d="M21.825 13.5C21.075 13.5 20.475 13.275 19.9875 12.7875C19.5 12.3 19.275 11.7 19.275 10.95C19.275 10.2 19.5 9.6 19.9875 9.1125C20.475 8.625 21.075 8.3875 21.825 8.3875C22.575 8.3875 23.175 8.625 23.6625 9.1125C24.15 9.6 24.3875 10.2 24.3875 10.95C24.3875 11.7 24.15 12.3 23.6625 12.7875C23.175 13.275 22.575 13.5 21.825 13.5ZM25.3875 20.725C25.3875 22.0625 25.05 23.2125 24.375 24.175C23.7 25.1375 22.8 25.8 21.675 26.1625L22.725 29.8375H20.25L19.3125 26.3375C18.6375 26.1625 18.075 25.875 17.625 25.475C17.175 25.075 16.875 24.5875 16.725 24.0125L13.65 20.45C13.05 21.4125 12.15 22.2 10.95 22.8125L12.1125 29.8375H9.525L7.2375 16.025H9.9375L10.9875 22.025C12.0375 21.35 12.8625 20.475 13.4625 19.4C14.0625 18.325 14.3625 17.1375 14.3625 15.8375V8.825H16.8375V15.65C16.8375 17.3 16.425 18.65 15.6 19.7L18.4125 22.8125C18.8625 22.1375 19.3125 21.625 19.7625 21.275C20.2125 20.925 20.6625 20.75 21.1125 20.75H25.3875V20.725Z"
  //     fill="#FFC107"
  //   />
  //   <path
  //     d="M19.275 10.95C19.275 11.7 19.5 12.3 19.9875 12.7875C20.475 13.275 21.075 13.5 21.825 13.5C22.575 13.5 23.175 13.275 23.6625 12.7875C24.15 12.3 24.3875 11.7 24.3875 10.95C24.3875 10.2 24.15 9.6 23.6625 9.1125C23.175 8.625 22.575 8.3875 21.825 8.3875C21.075 8.3875 20.475 8.625 19.9875 9.1125C19.5 9.6 19.275 10.2 19.275 10.95Z"
  //     stroke="#4A5568"
  //     strokeWidth="0.75"
  //   />
  //   <text
  //     x="35"
  //     y="27"
  //     fontFamily="Inter, sans-serif"
  //     fontSize="20"
  //     fontWeight="bold"
  //     fill="#1A202C"
  //   >
  <div className="flex gap-1 items-center">
    <img
      className="w-10 h-10 object-cover"
      src="https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/SuperBee.png?utm_source=zalo&utm_medium=zalo&utm_campaign=zalo"
    />
    SuperBee
  </div>
  // </text>
  // </svg>
);

export default function Header() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for mobile overlays
  const [mobileOverlayType, setMobileOverlayType] = useState(null); // 'notifications', 'cart', 'profile'

  const categoryDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const userMenuDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const cartDropdownRef = useRef(null);
  const mobileOverlayRef = useRef(null);

  // Mock data for categories with icons
  const categories = [
    { name: "THU ACC THANH LÝ ALL", icon: ShoppingBag, href: "#" },
    { name: "ACC LIÊN QUÂN SALE", icon: Flame, href: "#" },
    { name: "ACC BLOX FRUITS GIÁ RẺ", icon: DollarSign, href: "#" },
    { name: "ACC FREE FIRE GIÁ RẺ", icon: Gamepad2, href: "#" },
    { name: "ACC FF BUFF GIÁ RẺ", icon: Sparkles, href: "#" },
    { name: "ACC VALORANT", icon: Shield, href: "#" }
  ];

  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      avatarUrl: "https://placehold.co/40x40/E2E8F0/4A5568?text=SB",
      message:
        "Chào mừng hè, Shop đang có chương trình vòng quay nhận miễn phí quân huy và kim cương.",
      timestamp: "12:23 24-07-2024"
    },
    {
      id: 2,
      avatarUrl: "https://placehold.co/40x40/E2E8F0/4A5568?text=SB",
      message: "Lỗ cái bồ",
      timestamp: "21:19 25-04-2024"
    }
  ];

  // Mock data for cart items
  const cartItems = [
    {
      id: 1,
      name: "Acc Liên Quân VIP",
      price: "500.000đ",
      imageUrl: "https://placehold.co/60x60/E2E8F0/4A5568?text=LQ",
      href: "#"
    },
    {
      id: 2,
      name: "Blox Fruits Max Level",
      price: "350.000đ",
      imageUrl: "https://placehold.co/60x60/E2E8F0/4A5568?text=BF",
      href: "#"
    },
    {
      id: 3,
      name: "Skin Free Fire Hiếm",
      price: "1.200.000đ",
      imageUrl: "https://placehold.co/60x60/E2E8F0/4A5568?text=FF",
      href: "#"
    }
  ];

  const navLinks = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Mua Acc", href: "/mua-acc", icon: Gamepad2, id: "nav-mua-acc" },
    { name: "Dịch vụ", href: "/services", icon: Briefcase, id: "nav-dich-vu" },
    { name: "Tin Tức", href: "/news", icon: Newspaper, id: "nav-tin-tuc" }
  ];

  const toggleDropdown = (type) => {
    const isMobile = window.innerWidth < 768; // md breakpoint

    if (type === "category") setIsCategoryOpen(!isCategoryOpen);
    if (type === "notification") {
      if (isMobile) {
        setMobileOverlayType(
          mobileOverlayType === "notifications" ? null : "notifications"
        );
        setIsNotificationOpen(false); // Close desktop dropdown if open
      } else {
        setIsNotificationOpen(!isNotificationOpen);
      }
    }
    if (type === "user") {
      if (isMobile) {
        setMobileOverlayType(
          mobileOverlayType === "profile" ? null : "profile"
        );
        setIsUserMenuOpen(false);
      } else {
        setIsUserMenuOpen(!isUserMenuOpen);
      }
    }
    if (type === "cart") {
      if (isMobile) {
        setMobileOverlayType(mobileOverlayType === "cart" ? null : "cart");
        setIsCartOpen(false);
      } else {
        setIsCartOpen(!isCartOpen);
      }
    }
    if (type === "mobileMain") setIsMobileMenuOpen(!isMobileMenuOpen); // For the main hamburger menu
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      )
        setIsCategoryOpen(false);
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      )
        setIsNotificationOpen(false);
      if (
        userMenuDropdownRef.current &&
        !userMenuDropdownRef.current.contains(event.target)
      )
        setIsUserMenuOpen(false);
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target)
      )
        setIsCartOpen(false);

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("#mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        mobileOverlayRef.current &&
        !mobileOverlayRef.current.contains(event.target) &&
        !event.target.closest(".mobile-overlay-trigger")
      ) {
        setMobileOverlayType(null);
      }

      // Collapse search if click is outside search container and it's expanded
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
  }, [isSearchExpanded]); // Add isSearchExpanded to dependencies

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setMobileOverlayType(null);
  };

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
  };

  const CategoryDropdownContent = () => (
    <div className="absolute left-0 md:left-auto top-full z-20 mt-2 w-full md:w-[700px] lg:w-[800px] rounded-md border bg-white p-4 shadow-lg">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-150"
          >
            <category.icon className="h-10 w-10 text-blue-600 mb-1" />
            <span className="text-center text-xs font-medium text-gray-700">
              {category.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );

  const NotificationDropdownContent = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile
          ? "h-full flex flex-col"
          : "absolute right-0 top-full z-20 mt-2 w-80 sm:w-96 rounded-md border bg-white shadow-lg"
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-md font-semibold text-gray-800">Thông báo</h3>
        <button
          onClick={() =>
            isMobile ? setMobileOverlayType(null) : setIsNotificationOpen(false)
          }
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>
      <div className={`overflow-y-auto ${isMobile ? "flex-grow" : "max-h-80"}`}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <img
                src={notification.avatarUrl}
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/40x40/E2E8F0/4A5568?text=Err";
                }}
              />
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-gray-500 text-center">
            Không có thông báo mới.
          </p>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-2 border-t">
          <a
            href="#"
            className="block w-full text-center text-sm text-blue-600 hover:underline"
          >
            Xem tất cả
          </a>
        </div>
      )}
    </div>
  );

  const CartDropdownContent = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile
          ? "h-full flex flex-col"
          : "absolute right-0 top-full z-20 mt-2 w-80 sm:w-96 rounded-md border bg-white shadow-lg"
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-md font-semibold text-gray-800">Giỏ hàng</h3>
        <button
          onClick={() =>
            isMobile ? setMobileOverlayType(null) : setIsCartOpen(false)
          }
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>
      <div className={`overflow-y-auto ${isMobile ? "flex-grow" : "max-h-80"}`}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <a
              href={item.href}
              key={item.id}
              className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-16 w-16 rounded object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/60x60/E2E8F0/4A5568?text=Err";
                }}
              />
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-red-600 font-semibold">
                  {item.price}
                </p>
              </div>
            </a>
          ))
        ) : (
          <p className="p-4 text-sm text-gray-500 text-center">
            Giỏ hàng của bạn trống.
          </p>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="p-3 border-t">
          <a
            href="/cart" // Actual cart page
            className="block w-full text-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            onClick={() =>
              isMobile ? setMobileOverlayType(null) : setIsCartOpen(false)
            }
          >
            Xem giỏ hàng ({cartItems.length})
          </a>
        </div>
      )}
    </div>
  );

  const UserMenuContent = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile
          ? "h-full flex flex-col"
          : "absolute right-0 top-full z-20 mt-2 w-72 rounded-md border bg-white shadow-lg py-1"
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b md:hidden">
        <h3 className="text-md font-semibold text-gray-800">Tài khoản</h3>
        <button
          onClick={() => setMobileOverlayType(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close user menu"
        >
          <X size={18} />
        </button>
      </div>
      <div className={`${isMobile ? "flex-grow overflow-y-auto" : ""}`}>
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <img
              src="https://placehold.co/40x40/E2E8F0/4A5568?text=U"
              alt="Avatar"
              className="h-10 w-10 rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/40x40/E2E8F0/4A5568?text=Err";
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                hikarituisui
              </p>
              <p className="text-xs text-gray-500">Số dư: 0đ</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
            <p>Số dư Acoin: 0 Acoin</p>
            <p>Số dư khuyến mãi: 0đ</p>
            <p>ID: 2904356</p>
          </div>
        </div>
        {[
          { label: "Thông tin tài khoản", icon: Info, href: "/info" },
          { label: "Đổi mật khẩu", icon: Lock, href: "/info/change-password" },
          {
            label: "Lịch sử giao dịch",
            icon: HistoryIcon,
            href: "/info/transactions"
          }
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => (isMobile ? setMobileOverlayType(null) : null)}
          >
            <item.icon size={16} className="text-gray-500" />
            {item.label}
          </a>
        ))}
        <div className="border-t my-1"></div>
        <button
          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          onClick={() => (isMobile ? setMobileOverlayType(null) : null)}
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </div>
  );

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
                <div ref={categoryDropdownRef} className="relative">
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
                  {isCategoryOpen && <CategoryDropdownContent />}
                </div>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    {link.name}
                  </a>
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
                      /* setIsSearchExpanded(false); // Consider if onBlur is too aggressive */
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
            <a
              href="/recharge-atm"
              className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-white shadow-md hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              <CreditCard size={18} />
              <span className="hidden lg:inline">Nạp Tiền</span>
            </a>

            <div ref={notificationDropdownRef} className="relative">
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
              {isNotificationOpen && !mobileOverlayType && (
                <NotificationDropdownContent />
              )}
            </div>

            <div ref={cartDropdownRef} className="relative">
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
              {isCartOpen && !mobileOverlayType && <CartDropdownContent />}
            </div>

            <div ref={userMenuDropdownRef} className="relative">
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
                    hikarituisui
                  </p>
                  <p className="text-xs text-gray-500">Số dư: 0đ</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`hidden lg:block transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isUserMenuOpen && !mobileOverlayType && <UserMenuContent />}
            </div>
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
              <a
                href="/recharge-atm"
                onClick={handleMobileLinkClick}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
              >
                <CreditCard size={18} />
                Nạp Tiền Ngay
              </a>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={handleMobileLinkClick}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  <link.icon size={20} className="text-gray-500" />
                  {link.name}
                </a>
              ))}
              <div className="border-t pt-3 mt-3">
                <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase mb-2">
                  Danh mục sản phẩm
                </h3>
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    onClick={handleMobileLinkClick}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                  >
                    <category.icon size={20} className="text-gray-500" />
                    {category.name}
                  </a>
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
              if (e.target === e.currentTarget) setMobileOverlayType(null);
            }} // Close on backdrop click
          >
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
            ></div>
            <div
              ref={mobileOverlayRef}
              className="relative z-50 bg-white w-4/5 max-w-sm h-full shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0"
              // Add translate-x-full initially if you want slide-in animation from right
            >
              {mobileOverlayType === "notifications" && (
                <NotificationDropdownContent isMobile={true} />
              )}
              {mobileOverlayType === "cart" && (
                <CartDropdownContent isMobile={true} />
              )}
              {mobileOverlayType === "profile" && (
                <UserMenuContent isMobile={true} />
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
