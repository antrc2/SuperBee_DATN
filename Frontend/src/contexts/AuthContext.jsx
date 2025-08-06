// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import api from "../utils/http";
import { useNavigate } from "react-router-dom";
import { getDecodedToken } from "@utils/tokenUtils";
import { useNotification } from "@contexts/NotificationContext";
import { useContext } from "react";
import { checkLocation } from "../utils/hook";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { pop, showAlert, conFim } = useNotification();
  const [user, setUser] = useState(() => {
    const decoded = getDecodedToken();
    return decoded
      ? {
          id: decoded.user_id,
          name: decoded.name,
          money: decoded.money,
          avatar: decoded?.avatar,
          donate_code: decoded.donate_code,
        }
      : null;
  });
  const [auth, setAuth] = useState({
    roles: [],
    permissions: [],
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem("access_token"));
  const [error, setError] = useState(null); // Trạng thái lỗi riêng cho các thao tác auth
  const navigate = useNavigate();
  const [authInitialized, setAuthInitialized] = useState(false); // <--- THÊM STATE MỚI
  // useEffect để đồng bộ user và token khi access_token thay đổi (vd: đăng nhập thành công)
  // và để xử lý trường hợp token bị xóa hoặc không hợp lệ sau khi load
  useEffect(() => {
    const storedToken = sessionStorage.getItem("access_token");
    setToken(storedToken); // Cập nhật token state
    if (storedToken) {
      const decoded = getDecodedToken();
      if (decoded) {
        setUser({
          id: decoded.user_id,
          name: decoded.name,
          money: decoded.money,
          avatar: decoded?.avatar,
          donate_code: decoded.donate_code,
        });
      } else {
        sessionStorage.removeItem("access_token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true); // Bắt đầu loading cho thao tác login
    setError(null); // Reset lỗi
    try {
      const res = await api.post("/accounts/login", {
        username: credentials.username,
        password: credentials.password,
        web_id: credentials.web_id,
        "cf-turnstile-response": credentials["cf-turnstile-response"],
      });

      if (!res?.data?.status) {
        const { message, code, errors: validationErrors } = res.data;
        switch (code) {
          case "NO_ACTIVE": {
            const shouldActivate = await conFim(
              message ||
                "Tài khoản của bạn chưa được kích hoạt. Bạn có muốn kích hoạt tài khoản ngay bây giờ không?"
            );
            if (shouldActivate) {
              navigate("/activeAcc");
            }
            break;
          }
          case "LOCKED_ACCOUNT":
            pop(message || "Tài khoản của bạn đã bị khóa.", "e");
            break;
          case "INVALID_CREDENTIALS":
            pop(message || "Tên đăng nhập hoặc mật khẩu không đúng.", "e");
            break;
          case "VALIDATION_ERROR":
            pop(message || "Lỗi xác thực dữ liệu. Vui lòng kiểm tra lại.", "e");
            break;
          default:
            pop(message || "Đăng nhập thất bại. Vui lòng thử lại.", "e");
            break;
        }
        return { success: false, validationErrors: validationErrors || null };
      }

      if (!res?.data?.access_token) {
        pop("Không nhận được access_token từ server.", "e");
        return { success: false };
      }

      const accessToken = res.data.access_token;
      sessionStorage.setItem("access_token", accessToken);
      setToken(accessToken);
      const decoded = getDecodedToken();
      if (decoded) {
        setUser({
          id: decoded.user_id, // Thêm dòng này
          name: decoded.name,
          money: decoded.money,
          avatar: decoded.avatar,
          donate_code: decoded.donate_code,
        });
        pop("Đăng nhập thành công", "s");
        const savedLocation = await checkLocation();
        if (savedLocation) {
          localStorage.removeItem("location");
          window.location.href = `${savedLocation}`;
        } else {
          navigate("/");
        }
        return { success: true };
      } else {
        sessionStorage.removeItem("access_token");
        pop("Không thể giải mã token từ phản hồi server.", "e");
        return { success: false };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      const validationErrors = err.response?.data?.errors || null;
      pop(errorMessage, "e");
      setError({ message: errorMessage, code: err.response?.status || 500 });
      return { success: false, validationErrors: validationErrors };
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const register = async (credentials) => {
    setLoading(true); // Bắt đầu loading cho thao tác register
    setError(null); // Reset lỗi
    try {
      const res = await api.post("/accounts/register", {
        email: credentials.email,
        username: credentials.username,
        aff: credentials.aff,
        password: credentials.password,
      });

      if (!res?.data?.status) {
        const errorMessage = res.data.message || "Đăng ký không thành công.";
        const validationErrors = res.data.errors || null; // Capture validation errors
        pop(errorMessage, "e");
        setError({ message: errorMessage, code: res.status });
        return {
          success: false,
          message: errorMessage,
          validationErrors: validationErrors,
        };
      }

      pop("Đăng Ký thành công", "s");
      navigate("/auth/login");
      await showAlert(
        res?.data?.message || "Vui lòng xem Email để kích hoạt tài khoản"
      );
      return { success: true, data: res.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      const validationErrors = err.response?.data?.errors || null;
      setError({ message: errorMessage, code: err.response?.status || 500 });
      pop(errorMessage, "e");
      return {
        success: false,
        message: errorMessage,
        validationErrors: validationErrors,
      };
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post("/logout");
      setUser(null);
      sessionStorage.removeItem("access_token");
      setToken(null);
      setError(null);
      pop("Đăng xuất thành công", "s");
      navigate("/");
    } catch (err) {
      console.error("Logout error from AuthContext:", err);
      pop("Đăng xuất thất bại.", "e");
    } finally {
      setLoading(false);
    }
  }, [navigate, pop]);

  const isLoggedIn = !!user;
  const fetchUserMoney = useCallback(async () => {
    if (!token) {
      setAuthInitialized(true); // Nếu không có token, coi như đã khởi tạo xong
      return;
    }
    // setLoading(true); // Không cần set loading chung ở đây nữa
    try {
      const res = await api.get("/user/money");
      if (res.data && res.data.status) {
        setUser((prevUser) => ({
          ...prevUser,
          money: res.data.data.money,
        }));
        setAuth({
          roles: res.data.data.roles || [],
          permissions: res.data.data.permissions || [],
        });
      } else {
        // Nếu fetch thất bại (ví dụ token hết hạn), đăng xuất người dùng
        console.error("Failed to fetch user data:", res.data.message);
        logout(); // Cân nhắc tự động logout
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      logout(); // Tự động logout khi có lỗi API
    } finally {
      // setLoading(false);
      setAuthInitialized(true); // <--- ĐÁNH DẤU LÀ ĐÃ KHỞI TẠO XONG
    }
  }, [token, logout]);
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
        fetchUserMoney,
        authInitialized,
        ...auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("import { useAuth } from r");
  }
  return context;
}
