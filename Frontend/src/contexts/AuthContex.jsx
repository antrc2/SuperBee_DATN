import { createContext, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApiKey } from "@utils/getApiKey";
import {
  setApiKeyHook,
  useLocalStorage,
  writeToLocalStorage
} from "@utils/hook";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const Navigate = useNavigate();
  const Location = useLocation();
  // Set và lưu giá trị user khi đăng nhập
  const [user, setUser] = useState(null);
  // set và lưu giá trị lấy key từ localStorage
  const [apiKey, setApiKey] = useLocalStorage("Shop_Key", null);
  // cờ để kiểm tra xem có gọi lại api để lấy key không
  const shouldFetchKey = !apiKey;

  const fetchedApiKey = useApiKey(shouldFetchKey); // Hook chỉ chạy nếu cần thiết

  useEffect(() => {
    // Khi có fetchedApiKey và local chưa có => lưu vào localStorage
    if (shouldFetchKey && fetchedApiKey) {
      setApiKey(fetchedApiKey);
      writeToLocalStorage("Shop_Key", fetchedApiKey);
    }
    setApiKeyHook(apiKey);
  }, [apiKey, fetchedApiKey, setApiKey, shouldFetchKey]);

  useEffect(() => {
    // Khi app mount, đọc token từ localStorage, decode ra user
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser(payload.user);
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    }
  }, []);
  return (
    <AuthContext.Provider
      value={{
        Navigate,
        Location,
        Link,
        setUser,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
