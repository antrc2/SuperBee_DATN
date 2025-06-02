// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import { useApiKeyManager } from "@utils/useApiKeyManager.js";
import { useDomainCheck } from "@utils/useDomainCheck.js";

const AuthContext = createContext();

/**
 * authStatus có thể là:
 *  - "loading_key"       : đang fetch /data.json hoặc checking getApiKey()
 *  - "needs_key"         : không có key (fetch data.json lỗi hoặc người xóa key)
 *  - "ready_check_domain": đã có key, đang gọi /domain
 *  - "needs_activation"  : key hợp lệ nhưng /domain trả NO_ACTIVE
 *  - "invalid_key"       : key không được server chấp nhận
 *  - "app_ready"         : key OK & domain ACTIVE
 *  - "error"             : lỗi chung (404 /domain, network, JSON không đúng)
 */
export function AuthProvider({ children }) {
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
    // 1. Đang load key
    if (keyStatus === "idle" || keyStatus === "checking") {
      setAuthStatus("loading_key");
      setCombinedError(null);
      return;
    }

    // 2. Fetch data.json lỗi → needs_key
    if (keyStatus === "error") {
      setAuthStatus("needs_key");
      setCombinedError(keyError);
      return;
    }

    // 3. keyStatus === "ready" (đã có apiKey)
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
  }, [keyStatus, keyError, domainStatus, domainError]);

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
        apiKey,
        authStatus,
        combinedError,
        enterKey,
        retryDomain
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
