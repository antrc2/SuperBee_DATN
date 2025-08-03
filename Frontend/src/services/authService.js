// src/services/authService.js
import api from "@utils/http"; // Import instance Axios đã cấu hình

// GET /verify-email
export const verifyEmail = async (params) => {
  // Thường có token hoặc code trong params (query string)
  const response = await api.get("/verify-email", { params });
  return response.data;
};

// POST /refreshToken (mặc dù là POST, nhưng đây là API quan trọng cho auth flow)
export const postRefreshToken = async () => {
  const response = await api.post("/refreshToken");
  return response.data;
};

// GET /domain
export const getDomain = async () => {
  const response = await api.get("/domain");
  return response.data;
};

// POST /logout (mặc dù là POST, nhưng đây là API quan trọng cho auth flow)
export const postLogout = async () => {
  const response = await api.post("/logout");
  return response.data;
};
