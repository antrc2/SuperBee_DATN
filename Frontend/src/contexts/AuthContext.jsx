// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useApiKeyManager } from "@utils/useApiKeyManager.js";
import { useDomainCheck } from "@utils/useDomainCheck.js";
import api from "../utils/http";
import { useNavigate } from "react-router-dom";
import { getDecodedToken } from "@utils/tokenUtils";
import { useNotification } from "./NotificationProvider";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { pop, showAlert } = useNotification();
  const [user, setUser] = useState(() => {
    const decoded = getDecodedToken();
    return decoded
      ? {
          name: decoded.name,
          money: decoded.money,
        }
      : sessionStorage.getItem("access_token");
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hàm login
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/accounts/login", {
        username: credentials.username,
        password: credentials.password,
        web_id: credentials.web_id, // Make sure web_id is passed
      });

      // Server returns status: false for business logic errors (e.g., account not active, locked)
      if (!res?.data?.status) {
        setLoading(false);
        return {
          success: false,
          message: res.data.message || "Đăng nhập thất bại.",
          errors: res.data.errors || null,
          code: res.data.code || null, // Pass the custom code from the server
        };
      }

      if (!res?.data?.access_token) {
        setLoading(false);
        return {
          success: false,
          message: "Không nhận được access_token từ server.",
          errors: null,
          code: null,
        };
      }

      const accessToken = res.data.access_token;
      sessionStorage.setItem("access_token", accessToken);
      const decoded = getDecodedToken();

      if (decoded) {
        setUser({
          name: decoded.name,
          money: decoded.money,
          avatar: decoded.avatar,
        });
        setLoading(false);

        const locationOld = localStorage.getItem("location");
        if (locationOld) {
          const locationNew = locationOld;
          localStorage.removeItem("location");
          navigate(`${locationNew}`);
        } else {
          pop("Đăng nhập thành công", "s"); // This notification might be handled in LoginForm
          navigate("/"); // Navigate to home after successful login if no previous location
        }
        return { success: true, message: "Đăng nhập thành công." };
      } else {
        sessionStorage.removeItem("access_token"); // Clear invalid token
        setLoading(false);
        return {
          success: false,
          message: "Không thể giải mã token từ phản hồi server.",
          errors: null,
          code: null,
        };
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      // Set a generic error for AuthContext's own state, if needed for other components
      setError({ message: errorMessage });

      // Return detailed error for LoginForm to handle
      return {
        success: false,
        message: errorMessage,
        errors: err.response?.data?.errors || null,
        code: err.response?.data?.code || null,
      };
    }
  };
  const register = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/accounts/register", {
        email: credentials.email,
        username: credentials.username,
        aff: credentials.aff,
        password: credentials.password,
      });
      if (res?.data?.status == false) {
        throw new Error("Không nhận được access_token từ server.");
      }
      pop("Đăng Ký thành công", "s");
      navigate("/auth/login");
      await showAlert(
        res?.data?.message || "vui lòng xem Email để kích hoạt tài khoản"
      );
      return { success: true, data: res.data };
    } catch (err) {
      // console.error("Login error from AuthContext:", err);
      const errorMessage =
        err.response?.data?.errors ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setError({ message: errorMessage, code: err.response?.status || 500 });
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  // đăng xuất
  const logout = useCallback(async () => {
    try {
      const res = await api.post("/logout");
      if (res?.status == 500) {
        throw new Error("Không đăng xuất đc.");
      }
      setUser(null);
      sessionStorage.removeItem("access_token");
      setError(null);
      navigate("/");
    } catch (err) {
      console.error("Login error from AuthContext:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const {
    apiKey,
    status: keyStatus,
    errorMessage: keyError,
    saveKeyManually,
    clearKey,
  } = useApiKeyManager();

  const {
    domainStatus,
    errorMessage: domainError,
    retryCheck,
  } = useDomainCheck(apiKey);

  // 3. Tổng hợp authStatus + combinedError
  const [authStatus, setAuthStatus] = useState("loading_key");
  const [combinedError, setCombinedError] = useState(null);

  useEffect(() => {
    // Điều này sẽ kiểm tra lại token mỗi khi AuthProvider được render lại hoặc khi có sự thay đổi
    // trong logic AuthContext, đảm bảo user luôn được cập nhật đúng đắn
    const decoded = getDecodedToken();
    if (decoded) {
      setUser({ name: decoded.name, money: decoded.money });
    } else {
      setUser(null); // Đảm bảo user là null nếu token không hợp lệ/hết hạn
    }

    // Các logic về authStatus vẫn giữ nguyên
    if (keyStatus === "idle" || keyStatus === "checking") {
      setAuthStatus("loading_key");
      setCombinedError(null);
      return;
    }
    if (keyStatus === "error") {
      setAuthStatus("needs_key");
      setCombinedError(keyError);
      return;
    }
    if (domainStatus === "idle" || domainStatus === "checking") {
      setAuthStatus("ready_check_domain");
      setCombinedError(null);
      return;
    }
    if (domainStatus === "inactive") {
      setAuthStatus("needs_activation");
      setCombinedError(domainError);
      return;
    }
    if (domainStatus === "invalid_key") {
      setAuthStatus("invalid_key");
      setCombinedError(domainError);
      return;
    }
    if (domainStatus === "error") {
      setAuthStatus("error");
      setCombinedError(domainError);
      return;
    }
    if (domainStatus === "active") {
      setAuthStatus("app_ready");
      setCombinedError(null);
      return;
    }
  }, [keyStatus, keyError, domainStatus, domainError]); // Add dependencies

  // Hàm để user nhập thủ công API key (khi needs_key)
  const enterKey = useCallback(
    (newKey) => {
      clearKey();
      saveKeyManually(newKey);
    },
    [clearKey, saveKeyManually]
  );

  // Hàm retry khi ở needs_activation hoặc error_domain
  const retryDomain = useCallback(() => {
    retryCheck();
  }, [retryCheck]);
  const isLoggedIn = !!user;
  return (
    <AuthContext.Provider
      value={{
        navigate,
        isLoggedIn,
        apiKey,
        authStatus,
        combinedError,
        enterKey,
        retryDomain,
        login,
        register,
        user,
        loading,
        error,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
