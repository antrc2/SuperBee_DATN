// src/contexts/AppStatusContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useApiKeyManager } from "@utils/useApiKeyManager.js";
import { useDomainCheck } from "@utils/useDomainCheck.js";

// AppStatusContext quản lý trạng thái khởi tạo và sẵn sàng của toàn bộ ứng dụng
const AppStatusContext = createContext();

export function AppStatusProvider({ children }) {
  // Sử dụng các hook tùy chỉnh để quản lý API key và kiểm tra domain
  const {
    apiKey,
    status: keyStatus, // Trạng thái của API key (idle, checking, error, has_key)
    errorMessage: keyError,
    saveKeyManually,
    clearKey,
  } = useApiKeyManager();

  const {
    domainStatus, // Trạng thái của domain (idle, checking, inactive, invalid_key, error, active)
    errorMessage: domainError,
    retryCheck,
  } = useDomainCheck(apiKey);

  // appInitStatus: Trạng thái khởi tạo tổng quan của ứng dụng
  const [appInitStatus, setAppInitStatus] = useState("loading_initial");
  // combinedError: Lỗi tổng hợp từ quá trình kiểm tra key/domain
  const [combinedError, setCombinedError] = useState(null);
  // isLoading: Trạng thái boolean chung cho biết ứng dụng có đang trong quá trình khởi tạo/kiểm tra hay không
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Logic cập nhật appInitStatus và isLoading dựa trên keyStatus và domainStatus
    let newAppInitStatus = "loading_initial";
    let newCombinedError = null;
    let newIsLoading = true;

    // Ưu tiên kiểm tra trạng thái API key trước
    if (keyStatus === "idle" || keyStatus === "checking") {
      newAppInitStatus = "loading_key"; // Đang tải/kiểm tra key
      newIsLoading = true;
    } else if (keyStatus === "error") {
      newAppInitStatus = "needs_key"; // Cần key (có thể do lỗi đọc key hoặc key không có)
      newCombinedError = keyError;
      newIsLoading = false; // Quá trình kiểm tra key đã hoàn tất, dù có lỗi
    } else {
      // keyStatus là 'has_key'
      // Nếu có key, tiếp tục kiểm tra trạng thái domain
      if (domainStatus === "idle" || domainStatus === "checking") {
        newAppInitStatus = "ready_check_domain"; // Đang kiểm tra domain
        newIsLoading = true;
      } else if (domainStatus === "inactive") {
        newAppInitStatus = "needs_activation"; // Domain chưa kích hoạt
        newCombinedError = domainError;
        newIsLoading = false; // Quá trình kiểm tra domain đã hoàn tất
      } else if (domainStatus === "invalid_key") {
        newAppInitStatus = "invalid_key"; // Key không hợp lệ khi check domain
        newCombinedError = domainError;
        newIsLoading = false; // Quá trình kiểm tra domain đã hoàn tất
      } else if (domainStatus === "error") {
        newAppInitStatus = "error"; // Lỗi chung khi kiểm tra domain
        newCombinedError = domainError;
        newIsLoading = false; // Quá trình kiểm tra domain đã hoàn tất
      } else if (domainStatus === "active") {
        newAppInitStatus = "app_ready"; // Ứng dụng sẵn sàng
        newIsLoading = false; // Không còn loading khởi tạo
      }
    }

    setAppInitStatus(newAppInitStatus);
    setCombinedError(newCombinedError);
    setIsLoading(newIsLoading); // Cập nhật trạng thái loading tổng quan
  }, [keyStatus, keyError, domainStatus, domainError]); // Dependencies cho useEffect

  // Hàm để người dùng nhập thủ công API key (khi needs_key)
  const enterKey = useCallback(
    (newKey) => {
      clearKey(); // Đảm bảo key cũ được xóa trước khi lưu key mới
      saveKeyManually(newKey);
      setIsLoading(true); // Bắt đầu lại quá trình kiểm tra khi nhập key mới
    },
    [clearKey, saveKeyManually]
  );

  // Hàm retry khi ở needs_activation hoặc error_domain
  const retryDomain = useCallback(() => {
    retryCheck();
    setIsLoading(true); // Bắt đầu lại quá trình kiểm tra khi retry
  }, [retryCheck]);

  // Giá trị được cung cấp qua Context
  const value = {
    apiKey, // Có thể cung cấp apiKey ra ngoài nếu cần hiển thị
    appInitStatus, // Trạng thái khởi tạo ứng dụng
    combinedError, // Lỗi tổng hợp
    enterKey, // Hàm nhập key thủ công
    retryDomain, // Hàm thử lại kiểm tra domain
    isLoading, // Trạng thái loading tổng quan của AppStatusContext
  };

  return (
    <AppStatusContext.Provider value={value}>
      {children}
    </AppStatusContext.Provider>
  );
}

export function useAppStatus() {
  // EXPORT HOOK MỚI
  const context = useContext(AppStatusContext);
  if (context === undefined) {
    throw new Error("useAppStatus must be used within an AppStatusProvider");
  }
  return context;
}
