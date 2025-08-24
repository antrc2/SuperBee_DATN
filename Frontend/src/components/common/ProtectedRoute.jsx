import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext"; // Import hook chính

/**
 * Component "Người gác cổng" chỉ kiểm tra quyền (permission)
 * @param {React.ReactNode} children - Component con (trang cần bảo vệ)
 * @param {string} requiredPermission - Một quyền cụ thể bắt buộc phải có
 */
const ProtectedRoute = ({ children, requiredPermission }) => {
  // Lấy thông tin xác thực từ context
  const { isLoggedIn, permissions, authInitialized } = useAuth();
  const location = useLocation();

  // Chờ cho đến khi thông tin xác thực được khởi tạo xong
  if (!authInitialized) {
    // Có thể hiển thị một spinner loading ở đây
    return <div>Đang tải thông tin xác thực...</div>;
  }

  // 1. Kiểm tra đã đăng nhập chưa?
  if (!isLoggedIn) {
    // Nếu chưa, chuyển hướng về trang đăng nhập và lưu lại trang họ đang muốn vào
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra quyền cụ thể (nếu có yêu cầu)
  // Nếu không yêu cầu quyền cụ thể (undefined), mặc định là cho phép (ví dụ: trang dashboard chính)
  const hasRequiredPermission = requiredPermission
    ? permissions.includes(requiredPermission)
    : true;

  // 3. Nếu không có quyền yêu cầu -> Chuyển hướng đến trang "Không có quyền"
  if (!hasRequiredPermission) {
    return <Navigate to="/not-authorized" replace />;
  }

  // 4. Nếu vượt qua tất cả kiểm tra -> Cho phép truy cập
  return children;
};

export default ProtectedRoute;
