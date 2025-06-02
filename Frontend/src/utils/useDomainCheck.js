// src/hooks/useDomainCheck.js
import { useState, useEffect, useCallback } from "react";
import api from "../utils/http.js";

export function useDomainCheck(apiKey) {
  const [domainStatus, setDomainStatus] = useState("idle");
  // 'idle'        : chưa gọi /domain
  // 'checking'    : đang gọi /domain
  // 'active'      : server trả { code: "ACTIVE" }
  // 'inactive'    : server trả { code: "NO_ACTIVE" }
  // 'invalid_key' : server trả { code: "NO_API_KEY" } hoặc không có apiKey
  // 'error'       : các lỗi khác (404, network…)

  const [errorMessage, setErrorMessage] = useState(null);

  const checkDomain = useCallback(async () => {
    if (!apiKey) {
      setDomainStatus("invalid_key");
      setErrorMessage("Không có API key.");
      return;
    }

    setDomainStatus("checking");
    setErrorMessage(null);
    // Header Authorization đã được axios interceptor tự thêm từ getApiKey()

    try {
      const response = await api.get("/domain");
      // console.log("🚀 ~ checkDomain ~ response:", response);

      if (response.status === 404) {
        throw new Error("Endpoint /domain không tồn tại (404).");
      }
      const code = response.data?.code;
      // console.log("🚀 ~ checkDomain ~ code:", code);

      if (code === "ACTIVE") {
        setDomainStatus("active");
        setErrorMessage(null);
      } else if (code === "NO_ACTIVE") {
        setDomainStatus("inactive");
        setErrorMessage("Domain chưa được kích hoạt.");
      } else if (code === "NO_API_KEY") {
        setDomainStatus("invalid_key");
        setErrorMessage("API key bị từ chối (NO_API_KEY).");
      } else {
        throw new Error("Phản hồi /domain không hợp lệ.");
      }
    } catch (err) {
      console.error("useDomainCheck error:", err);
      const respCode = err.response?.data?.code;
      if (respCode === "NO_ACTIVE") {
        setDomainStatus("inactive");
        setErrorMessage("Domain chưa kích hoạt.");
      } else if (respCode === "NO_API_KEY") {
        setDomainStatus("invalid_key");
        setErrorMessage("API key bị từ chối (NO_API_KEY).");
      } else {
        setDomainStatus("error");
        setErrorMessage(
          err.message || "Lỗi không xác định khi kiểm tra domain."
        );
      }
    }
  }, [apiKey]);

  // Khi apiKey thay đổi (null → có giá trị), hook tự động gọi checkDomain()
  useEffect(() => {
    if (apiKey) {
      checkDomain();
    }
  }, [apiKey, checkDomain]);

  return {
    domainStatus,
    errorMessage,
    retryCheck: checkDomain
  };
}
