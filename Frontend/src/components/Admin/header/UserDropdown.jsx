// src/components/Admin/header/UserDropdown.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { LogOut, User as UserIcon, DollarSign } from "lucide-react";

const UserDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
      >
        <span className="h-10 w-10 rounded-full">
          <img
            className="h-full w-full rounded-full object-cover"
            src={user.avatar || "/images/user/default-avatar.png"}
            alt="User Avatar"
          />
        </span>
      </button>

      {/* Dropdown Menu */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-64 flex-col rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
          dropdownOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={user.avatar || "/images/user/default-avatar.png"}
            alt="User Avatar"
          />
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              {user.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(user.money || 0)}
            </p>
          </div>
        </div>

        <ul className="flex flex-col p-2">
          {/* <li>
            <Link
              to="/profile"
              className="flex items-center gap-3.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setDropdownOpen(false)}
            >
              <UserIcon size={18} />
              Thông tin cá nhân
            </Link>
          </li> */}
          <li>
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-3.5 rounded-md px-3 py-2 text-sm font-medium text-red-500 duration-300 ease-in-out hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDropdown;
