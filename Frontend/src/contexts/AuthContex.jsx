import { createContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApiKey } from "@utils/getApiKey";
import { setApiKeyHook, useSessionStorage, setSessionValue } from "@utils/hook";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const Navigate = useNavigate();
  const Location = useLocation();
  const [apiKey, setApiKey] = useSessionStorage("Shop_Key");
  const shouldFetchKey = !apiKey;

  const fetchedApiKey = useApiKey(shouldFetchKey); // Hook chỉ chạy nếu cần thiết

  useEffect(() => {
    // Khi có fetchedApiKey và local chưa có => lưu vào sessionStorage
    if (shouldFetchKey && fetchedApiKey) {
      setApiKey(fetchedApiKey);
      setSessionValue("Shop_Key", fetchedApiKey);
    }
    setApiKeyHook(apiKey);
  }, [apiKey, fetchedApiKey, setApiKey, shouldFetchKey]);

  return (
    <AuthContext.Provider
      value={{
        Navigate,
        Location,
        Link,
        apiKey
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
