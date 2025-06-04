// src/hooks/useApiKeyManager.js
import { useState, useEffect, useCallback } from "react";
import { getApiKey, setApiKeyHook } from "../utils/hook.js";

export function useApiKeyManager() {
  const [apiKey, setApiKeyState] = useState(() => getApiKey());
  const [status, setStatus] = useState(() => (getApiKey() ? "ready" : "idle"));
  // 'idle'     : chưa check data.json, chưa có key
  // 'checking' : đang fetch /data.json
  // 'ready'    : đã có key (từ data.json hoặc người dùng nhập)
  // 'error'    : lỗi khi fetch /data.json

  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Khi mount, nếu chưa có key, fetch /data.json
  useEffect(() => {
    const sessionStorageAPI = sessionStorage.getItem("web") ?? null;
    if (sessionStorageAPI) {
      setApiKeyHook(sessionStorageAPI);
      setApiKeyState(sessionStorageAPI);
      setStatus("ready");
      setErrorMessage(null);
      return;
    }

    // Nếu chưa có key, bắt đầu fetch data.json
    setStatus("checking");
    fetch("/data.json")
      .then((res) => {
        if (res.status === 404) {
          throw new Error("File /data.json không tồn tại (404).");
        }
        if (!res.ok) {
          throw new Error(`Không tải được data.json: ${res.statusText}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json && json.API_KEY) {
          // Lưu vào biến module qua setApiKeyHook
          setApiKeyHook(json.API_KEY);
          sessionStorage.setItem("web", json.API_KEY);
          setApiKeyState(json.API_KEY);
          setStatus("ready");
          setErrorMessage(null);
        } else {
          throw new Error("Không tìm thấy trường API_KEY trong /data.json.");
        }
      })
      .catch((err) => {
        console.error("useApiKeyManager error:", err);
        sessionStorage.removeItem("web");
        setApiKeyState(null);
        setStatus("error");
        setErrorMessage(err.message);
      });
  }, []);

  // Hàm để user nhập thủ công API key (override data.json)
  const saveKeyManually = useCallback((newKey) => {
    setApiKeyHook();
    sessionStorage.setItem("web", newKey);
    setApiKeyState(newKey);
    setStatus("ready");
    setErrorMessage(null);
  }, []);

  // Hàm xóa key (nếu cần reset hoàn toàn)
  const clearKey = useCallback(() => {
    setApiKeyHook(null);
    setApiKeyState(null);
    sessionStorage.removeItem("web");
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    apiKey, // string | null
    status, // 'idle' | 'checking' | 'ready' | 'error'
    errorMessage, // string | null
    saveKeyManually, // function(newKey)
    clearKey // function()
  };
}
