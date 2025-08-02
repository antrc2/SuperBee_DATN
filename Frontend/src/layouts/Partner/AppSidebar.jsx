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
} from "lucide-react";
import SuperBeeLogo from "../../components/Client/layout/SuperBeeLogo";
import { useSidebar } from "@contexts/SidebarContext";
import { useRoles } from "../../utils/role";

// Cập nhật navItems với các biểu tượng từ lucide-react
const navItems = [
  {
    icon: <LayoutGrid />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/partner", pro: false }],
  },

  {
    icon: <Package />, // Biểu tượng phù hợp hơn cho Products
    name: "Products",
    path: "/partner/products",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const roles = useRoles();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeMenuInfo, setActiveMenuInfo] = useState({
    parent: null,
    self: null,
  });
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  useEffect(() => {
    let bestMatch = { path: "", parent: null, self: null };

    const visibleItems = navItems.filter(
      (navItem) => !navItem.view || navItem.view.some((role) => roles[role])
    );

    for (const navItem of visibleItems) {
      if (navItem.subItems) {
        for (const subItem of navItem.subItems) {
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
  }, [location.pathname, roles]);

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

  const renderMenuItems = (items) => (
    <ul className="flex flex-col gap-4">
      {items
        .filter(
          (navItem) => !navItem.view || navItem.view.some((role) => roles[role])
        )
        .map((nav) => {
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
                    {nav.subItems
                      .filter(
                        (subItem) =>
                          !subItem.view ||
                          subItem.view.some((role) => roles[role])
                      )
                      .map((subItem) => {
                        const isChildActive =
                          activeMenuInfo.self === subItem.name;
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
          <SuperBeeLogo className="w-8 h-8   " />
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
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
