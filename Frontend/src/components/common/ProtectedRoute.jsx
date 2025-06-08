// Tạo file mới, ví dụ: src/components/common/ProtectedRoute.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasRequiredRole } from "@utils/tokenUtils";

/**
 * Component "gác cổng" để bảo vệ các route.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Component con sẽ được render nếu được phép.
 * @param {string[]} props.allowedRoles - Mảng các vai trò được phép truy cập.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAllowed = hasRequiredRole(allowedRoles);

  if (!isAllowed) {
    // Người dùng không có quyền.
    // Chuyển hướng họ đến trang đăng nhập.
    // `state={{ from: location }}` giúp chuyển hướng người dùng trở lại trang họ muốn sau khi đăng nhập thành công.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Nếu có quyền, render component con
  return children;
};

export default ProtectedRoute;
