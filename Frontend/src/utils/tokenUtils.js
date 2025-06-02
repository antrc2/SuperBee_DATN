// src/utils/tokenUtils.js
import { jwtDecode } from "jwt-decode"; // Đảm bảo đã cài đặt 'jwt-decode'

/**
 * Lấy token từ localStorage và giải mã nó.
 * Kiểm tra tính hợp lệ của token (có tồn tại, là chuỗi, chưa hết hạn).
 *
 * @returns {object | null} Payload của token nếu hợp lệ, ngược lại là null.
 */
export function getDecodedToken() {
  const token = localStorage.getItem("access_token");

  if (!token || typeof token !== "string") {
    // console.log("No token found or invalid token type in localStorage.");
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    // Kiểm tra thời gian hết hạn (expiration time) của token
    // `exp` thường là số giây từ Epoch (Unix timestamp)
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    if (decoded.exp && decoded.exp < currentTime) {
      console.log("Token has expired.");
      localStorage.removeItem("access_token"); // Xóa token hết hạn
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Error decoding token from localStorage:", error);
    localStorage.removeItem("access_token"); // Xóa token lỗi/không hợp lệ
    return null;
  }
}
