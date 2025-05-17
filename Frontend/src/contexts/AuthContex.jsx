import { createContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApiKey } from "../utils/getApiKey";
import {
  setApiKeyHook,
  useLocalStorage,
  writeToLocalStorage
} from "../utils/hook";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const Navigate = useNavigate();
  const Location = useLocation();
  const [apiKey, setApiKey] = useLocalStorage("Shop_Key", null);
  const shouldFetchKey = !apiKey;

  const fetchedApiKey = useApiKey(shouldFetchKey); // Hook chỉ chạy nếu cần thiết

  useEffect(() => {
    // Khi có fetchedApiKey và local chưa có => lưu vào localStorage
    if (shouldFetchKey && fetchedApiKey) {
      setApiKey(fetchedApiKey);
      writeToLocalStorage("Shop_Key", fetchedApiKey);
    }
    setApiKeyHook(apiKey);
  }, [fetchedApiKey, shouldFetchKey]);

  return (
    <AuthContext.Provider
      value={{
        Navigate,
        Location,
        Link
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
