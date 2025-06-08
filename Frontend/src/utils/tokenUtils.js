// src/utils/tokenUtils.js

import { jwtDecode } from "jwt-decode";

/**
 * Lấy token từ sessionStorage và giải mã nó.
 * ... (giữ nguyên hàm getDecodedToken của bạn)
 */
export function getDecodedToken() {
  const token = sessionStorage.getItem("access_token");
  if (!token || typeof token !== "string") {
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      console.log("Token has expired.");
      sessionStorage.removeItem("access_token");
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    sessionStorage.removeItem("access_token");
    return null;
  }
}

/**
 * Lấy danh sách vai trò (roles) của người dùng hiện tại từ token.
 * @returns {string[] | null} Mảng các vai trò hoặc null nếu không có token.
 */
export const getCurrentUserRoles = () => {
  const decodedToken = getDecodedToken();
  if (!decodedToken) {
    return null;
  }
  // Giả sử vai trò được lưu trong `role_ids`. Có thể là 'roles' hoặc tên khác.
  return decodedToken.role_ids || [];
};

/**
 * KIỂM TRA QUYỀN TRUY CẬP DỰA TRÊN VAI TRÒ
 *
 * @param {string[]} allowedRoles - Mảng các vai trò được phép truy cập.
 * @returns {boolean} True nếu người dùng có ít nhất một trong các vai trò được yêu cầu, ngược lại là false.
 */
export const hasRequiredRole = (allowedRoles) => {
  const userRoles = getCurrentUserRoles();

  if (!userRoles) {
    return false; // Không đăng nhập
  }

  // Nếu không yêu cầu vai trò cụ thể, chỉ cần đăng nhập là được
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Kiểm tra xem người dùng có bất kỳ vai trò nào trong danh sách allowedRoles không
  return userRoles.some((role) => allowedRoles.includes(role));
};
