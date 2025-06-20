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
  const { pop, showAlert, conFim } = useNotification();
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

  const login = async (credentials) => {
    setLoading(true);

    try {
      const res = await api.post("/accounts/login", {
        username: credentials.username,
        password: credentials.password,
        web_id: credentials.web_id,
      });

      // Handle unsuccessful response from server
      if (!res?.data?.status) {
        await handleLoginError(res.data);
        setLoading(false);
        return { success: false };
      }

      // Handle missing access token
      if (!res?.data?.access_token) {
        pop("Không nhận được access_token từ server.", "e");
        setLoading(false);
        return { success: false };
      }

      // Success - process token and set user
      const accessToken = res.data.access_token;
      sessionStorage.setItem("access_token", accessToken);
      const decoded = getDecodedToken();

      if (decoded) {
        setUser({
          name: decoded.name,
          money: decoded.money,
          avatar: decoded.avatar,
        });

        // Show success message
        pop("Đăng nhập thành công", "s");

        // Handle navigation
        const savedLocation = localStorage.getItem("location");
        if (savedLocation) {
          localStorage.removeItem("location");
          navigate(savedLocation);
        } else {
          navigate("/");
        }

        setLoading(false);
        return { success: true };
      } else {
        sessionStorage.removeItem("access_token");
        pop("Không thể giải mã token từ phản hồi server.", "e");
        setLoading(false);
        return { success: false };
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      pop(errorMessage, "e");
      return { success: false };
    }
  };

  // Handle different types of login errors
  const handleLoginError = async (errorData) => {
    const { message, code } = errorData;

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
        // For validation errors, we'll return them to be handled by the form
        // The form component can access these through the return value
        break;

      default:
        pop(message || "Đăng nhập thất bại. Vui lòng thử lại.", "e");
        break;
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
