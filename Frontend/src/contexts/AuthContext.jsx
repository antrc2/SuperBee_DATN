// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import { useApiKeyManager } from "@utils/useApiKeyManager.js"; // Đảm bảo đường dẫn đúng
import { useDomainCheck } from "@utils/useDomainCheck.js"; // Đảm bảo đường dẫn đúng
import api from "../utils/http";
import { useNavigate } from "react-router-dom";
import { getDecodedToken } from "@utils/tokenUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // `user` sẽ được khởi tạo từ localStorage
  const [user, setUser] = useState(() => {
    const decoded = getDecodedToken();
    return decoded
      ? {
          name: decoded.name,
          money: decoded.money /* other user data from token */
        }
      : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Đổi tên `navigator` thành `Maps` cho chuẩn React Router

  // Hàm login
  const login = async (credentials) => {
    setLoading(true);
    setError(null); // Xóa lỗi cũ
    // Không cần setUser(null) ở đây, vì nếu login thành công sẽ set lại
    // Nếu thất bại thì error sẽ được set và user vẫn là null (nếu trước đó là null)

    try {
      const res = await api.post("/accounts/login", {
        username: credentials.username,
        password: credentials.password
      });

      if (!res?.data?.access_token) {
        throw new Error("Không nhận được access_token từ server.");
      }

      const accessToken = res.data.access_token;
      localStorage.setItem("access_token", accessToken);

      const decoded = getDecodedToken(); // Sử dụng hàm đã tách
      if (decoded) {
        setUser({ name: decoded.name, money: decoded.money }); // Cập nhật trạng thái user
        navigate("/"); // Điều hướng về trang chính sau khi đăng nhập thành công
      } else {
        // Nếu token không giải mã được sau khi nhận từ API
        throw new Error("Không thể giải mã token từ phản hồi server.");
      }

      return { success: true, data: res.data };
    } catch (err) {
      console.error("Login error from AuthContext:", err);
      // Kiểm tra nếu lỗi từ server phản hồi
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setError({ message: errorMessage, code: err.response?.status || 500 });
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("access_token");
    setError(null);
    navigate("/"); // Điều hướng về trang đăng nhập
  }, [navigate]); // Thêm navigate vào dependencies nếu bạn đang dùng nó bên trong useCallback

  // **Quan trọng:** Logic khởi tạo user từ token trong localStorage chỉ nên nằm ở đây (hoặc trong hàm getDecodedToken).
  // Việc kiểm tra token ở đây và set user ngay ngoài function component là không đúng trong React
  // const token = localStorage.getItem("access_token") ?? null;
  // if (token) {
  //   const data = decodeData(token);
  //   const { name, money } = data;
  //   setUser({ name, money });
  // }
  // <-- Đoạn code này cần bị xóa khỏi AuthProvider trực tiếp.
  //    Thay vào đó, nó được xử lý bởi `useState(() => ...)` và `useEffect`.

  // --- Các logic về API key và domain check vẫn giữ nguyên ---
  // 1. Quản lý API key
  const {
    apiKey,
    status: keyStatus,
    errorMessage: keyError,
    saveKeyManually,
    clearKey
  } = useApiKeyManager();

  // 2. Khi đã có apiKey (keyStatus === "ready"), qua bước check domain
  const {
    domainStatus,
    errorMessage: domainError,
    retryCheck
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

  return (
    <AuthContext.Provider
      value={{
        navigate, // Đổi tên từ navigator
        apiKey,
        authStatus,
        combinedError,
        enterKey,
        retryDomain,
        login,
        // register, // Nếu hàm register chưa được triển khai hoàn chỉnh, có thể tạm thời bỏ qua
        user,
        loading,
        error,
        setUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
