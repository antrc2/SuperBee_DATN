import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext"; // Import hook chính

/**
 * Component "Người gác cổng"
 * @param {React.ReactNode} children - Component con (trang cần bảo vệ)
 * @param {string[]} allowedRoles - Mảng các vai trò được phép truy cập
 * @param {string} requiredPermission - Một quyền cụ thể bắt buộc phải có
 */
const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
  // Lấy thông tin xác thực từ context
  const { isLoggedIn, roles, permissions, authInitialized } = useAuth();

  const location = useLocation();
  if (!authInitialized) {
    return <div>Bạn là ai????...</div>;
  }

  // 1. Kiểm tra đã đăng nhập chưa?
  if (!isLoggedIn) {
    // Nếu chưa, chuyển hướng về trang đăng nhập và lưu lại trang họ đang muốn vào
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra vai trò (nếu có yêu cầu)
  // .some() sẽ trả về true nếu tìm thấy ít nhất một vai trò của người dùng nằm trong danh sách allowedRoles
  const hasRequiredRole = allowedRoles
    ? roles.some((role) => allowedRoles.includes(role))
    : true;

  // 3. Kiểm tra quyền cụ thể (nếu có yêu cầu)
  const hasRequiredPermission = requiredPermission
    ? permissions.includes(requiredPermission)
    : true;

  // 4. Nếu không có vai trò hoặc quyền yêu cầu -> Chuyển hướng đến trang "Không có quyền"
  if (!hasRequiredRole || !hasRequiredPermission) {
    return <Navigate to="/not-authorized" replace />;
  }

  // 5. Nếu vượt qua tất cả kiểm tra -> Cho phép truy cập
  return children;
};

export default ProtectedRoute;
