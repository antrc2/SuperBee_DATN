import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Sửa thành react-router-dom

// Nhập các biểu tượng cần thiết từ lucide-react
import {
  LayoutGrid,
  Users,
  TicketPercent,
  LayoutList,
  Package,
  ShoppingCart,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  Newspaper,
  Folders,
} from "lucide-react";
import Logo from "@assets/icons/logo.png";
import { useSidebar } from "@contexts/SidebarContext";
import { usePermissions } from "@utils/usePermissions.js";
// Cập nhật navItems với các biểu tượng từ lucide-react
const navItems = [
  {
    icon: <LayoutGrid />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/admin", pro: false }],
  },
  {
    icon: <Users />,
    name: "Users",
    path: "/admin/users",
  },
  {
    icon: <TicketPercent />,
    name: "Discount Code", // Sửa lại tên cho dễ đọc
    path: "/admin/discountcode",
  },
  {
    icon: <TicketPercent />,
    name: "Donate Promotion", // Sửa lại tên cho dễ đọc
    path: "/admin/donatePromotions",
  },
  {
    icon: <LayoutList />, // Biểu tượng phù hợp hơn cho Categories
    name: "Categories",
    path: "/admin/categories",
  },
  {
    icon: <Package />, // Biểu tượng phù hợp hơn cho Products
    name: "Products",
    path: "/admin/products",
  },
  {
    icon: <Package />, // Biểu tượng phù hợp hơn cho Products
    name: "PendingProduct",
    path: "/admin/pendingProducts",
  },
  {
    icon: <ShoppingCart />, // Biểu tượng phù hợp hơn cho Orders
    name: "Orders",
    path: "/admin/orders",
  },
  {
    icon: <Calendar />,
    name: "Banners",
    path: "/admin/banners",
  },
  {
    icon: <Calendar />,
    name: "agent",
    path: "/admin/agent",
  },
  {
    icon: <Folders />,
    name: "CategoryPost",
    path: "/admin/categoryPost",
  },
  {
    icon: <Newspaper />,
    name: "Post",
    path: "/admin/post",
  },
  {
    icon: <Newspaper />,
    name: "Authorization",
    // path: "/admin/authorization",
    subItems: [
      {
        name: " Dashboard ",
        path: "/admin/authorization",
        pro: false,
      },
      { name: "Roles", path: "/admin/authorization/roles", pro: false },
      {
        name: "Permissions",
        path: "/admin/authorization/permissions",
        pro: false,
      },
    ],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});
  const admin = useRef(false);
  const adminsuper = useRef(false);
  const reseller = useRef(false);
  const partner = useRef(false);
  const ketoan = useRef(false);
  const hotro = useRef(false);
  const marketing = useRef(false);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );
  const { hasRole } = usePermissions();
  admin.current = hasRole("admin");
  adminsuper.current = hasRole("admin-super");
  reseller.current = hasRole("reseller");
  partner.current = hasRole("partner");
  ketoan.current = hasRole("ke-toan");
  hotro.current = hasRole("nv-ho-tro");
  marketing.current = hasRole("nv-marketing");
  console.log("🚀 ~ AppSidebar ~ admin:", admin.current);
  console.log("🚀 ~ AppSidebar ~ adminsuper:", adminsuper.current);
  console.log("🚀 ~ AppSidebar ~ reseller:", reseller.current);
  console.log("🚀 ~ AppSidebar ~ partner:", partner.current);
  console.log("🚀 ~ AppSidebar ~ ketoan:", ketoan.current);
  console.log("🚀 ~ AppSidebar ~ hotro:", hotro.current);
  console.log("🚀 ~ AppSidebar ~ marketing:", marketing.current);
  useEffect(() => {
    let submenuMatched = false;
    // Giả sử 'menuType' được định nghĩa ở đâu đó, nếu không, chúng ta sẽ mặc định là 'main'
    const menuType = "main";
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: menuType,
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {/* lucide-react icons không cần set size qua className, chúng kế thừa từ font size hoặc có thể set qua props `size` */}
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                // Thay thế ChevronDownIcon bằng ChevronDown
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`pt-2 pb-4 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden max-w-44 object-fit-contain"
                src={Logo}
                alt="Logo"
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  // Thay thế HorizontaLDots bằng MoreHorizontal
                  <MoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
