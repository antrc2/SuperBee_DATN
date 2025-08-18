import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
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
  CircleDollarSign,
  Home,
} from "lucide-react";

import SuperBeeLogo from "../../components/Client/layout/SuperBeeLogo";
import { useSidebar } from "@contexts/SidebarContext";
import { usePermissions } from "../../utils/usePermissions"; // Điều chỉnh đường dẫn nếu cần

const navItems = [
  {
    icon: <Home />,
    name: "Trang chủ",
    path: "/",
  },
  {
    icon: <LayoutGrid />,
    name: "Dashboard",
    requiredPermissions: ["reports.view"],
    subItems: [
      { name: "Ecommerce", path: "/admin", requiredPermission: "reports.view" },
    ],
  },
  {
    icon: <Calendar />,
    name: "Ảnh Banners",
    path: "/admin/banners",
    requiredPermission: "banners.view",
  },
  {
    icon: <Users />,
    name: "Tài Khoản",
    path: "/admin/users",
    requiredPermission: "users.view",
  },
  {
    icon: <Newspaper />,
    name: "Phân quyền",
    requiredPermissions: ["roles.view", "permissions.view"],
    subItems: [
      {
        name: "Tổng Quan",
        path: "/admin/authorization",
        requiredPermission: "roles.view",
      },
      {
        name: "Vai Trò",
        path: "/admin/authorization/roles",
        requiredPermission: "roles.view",
      },
      {
        name: "Quyền Hệ Thống",
        path: "/admin/authorization/permissions",
        requiredPermission: "permissions.view",
      },
    ],
  },
  {
    icon: <TicketPercent />,
    name: "Mã Giảm giá",
    path: "/admin/discountcode",
    requiredPermission: "promotions.view",
  },
  {
    icon: <TicketPercent />,
    name: "Khuyến Mãi Nạp Thẻ",
    path: "/admin/donatePromotions",
    requiredPermission: "donate_promotions.view",
  },
  {
    icon: <LayoutList />,
    name: "Danh Mục Sản Phẩm",
    path: "/admin/categories",
    requiredPermission: "categories.view",
  },
  {
    icon: <Package />,
    name: "Sản Phẩm",
    path: "/admin/products",
    requiredPermission: "products.view",
  },
  {
    icon: <Package />,
    name: "Duyệt Sản Phẩm",
    path: "/admin/pendingProducts",
    requiredPermission: "products.approve",
  },
  // ===================== THAY ĐỔI CHÍNH Ở ĐÂY =====================
  {
    icon: <CircleDollarSign />,
    name: "Tài chính",
    path: "/admin/financials",
    // Sửa từ requiredPermission thành requiredPermissions
    // Giờ đây, chỉ cần người dùng có 1 trong 3 quyền này là sẽ thấy mục "Tài chính"
    requiredPermissions: [
      "transactions.view",
      "recharges.view",
      "withdrawals.view",
    ],
  },
  // ================================================================
  {
    icon: <Calendar />,
    name: "Tin Nhắn",
    path: "/admin/agent",
    requiredPermission: "chat.view",
  },
  {
    icon: <Folders />,
    name: "Danh Mục Tin Tức",
    path: "/admin/categoryPost",
    requiredPermission: "post_categories.view",
  },
  {
    icon: <Newspaper />,
    name: "Tin Tức",
    path: "/admin/post",
    requiredPermission: "posts.view",
  },
  {
    icon: <Newspaper />,
    name: "Rút tiền",
    path: "/admin/withdrawals",
    requiredPermission: "withdrawals.view",
  },
  {
    icon: <ShoppingCart />,
    name: "Đơn Hàng",
    path: "/admin/orders",
    requiredPermission: "orders.view",
  },
  {
    icon: <Newspaper />,
    name: "Khiếu Nại",
    path: "/admin/disputes",
    requiredPermission: "product_reports.view",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { can } = usePermissions();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeMenuInfo, setActiveMenuInfo] = useState({
    parent: null,
    self: null,
  });
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const checkPermission = useCallback(
    (item) => {
      if (item.requiredPermissions) {
        return item.requiredPermissions.some((p) => can(p));
      }
      if (item.requiredPermission) {
        return can(item.requiredPermission);
      }
      return true;
    },
    [can]
  );

  const visibleItems = useMemo(() => {
    return navItems.filter(checkPermission);
  }, [checkPermission]);

  useEffect(() => {
    let bestMatch = { path: "", parent: null, self: null };

    for (const navItem of visibleItems) {
      if (navItem.subItems) {
        const visibleSubItems = navItem.subItems.filter(checkPermission);
        for (const subItem of visibleSubItems) {
          if (
            subItem.path &&
            location.pathname.startsWith(subItem.path) &&
            subItem.path.length > bestMatch.path.length
          ) {
            bestMatch = {
              path: subItem.path,
              parent: navItem.name,
              self: subItem.name,
            };
          }
        }
      } else if (navItem.path) {
        if (
          location.pathname.startsWith(navItem.path) &&
          navItem.path.length > bestMatch.path.length
        ) {
          bestMatch = { path: navItem.path, parent: null, self: navItem.name };
        }
      }
    }

    setActiveMenuInfo({ parent: bestMatch.parent, self: bestMatch.self });
    setOpenSubmenu(bestMatch.parent);
  }, [location.pathname, visibleItems, checkPermission]);

  useEffect(() => {
    if (openSubmenu && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (itemName) => {
    setOpenSubmenu((prevOpenSubmenu) =>
      prevOpenSubmenu === itemName ? null : itemName
    );
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {visibleItems.map((nav) => {
        const isParentActive =
          activeMenuInfo.parent === nav.name ||
          activeMenuInfo.self === nav.name;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(nav.name)}
                className={`menu-item group ${
                  isParentActive ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isParentActive
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDown
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu === nav.name ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isParentActive ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isParentActive
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
                  if (el) subMenuRefs.current[nav.name] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu === nav.name
                      ? `${subMenuHeight[nav.name] || 0}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.filter(checkPermission).map((subItem) => {
                    const isChildActive = activeMenuInfo.self === subItem.name;
                    return (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isChildActive
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
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
        className={`pt-3 pb-3 flex ${
          !isExpanded && !isHovered ? "lg:opacity-0" : "justify-center"
        }`}
      >
        <div className="hidden lg:block">
          <SuperBeeLogo className="w-8 h-8" />
        </div>
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
                  <MoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
