import axios from "axios";
import { refreshToken } from "./refreshToken.js";
import { getApiKey } from "./hook.js";
// import { runAfter3Seconds } from "./time.js";

const defaultConfig = {
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30_000,
};

const api = axios.create(defaultConfig);

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (!token) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return Promise.reject(new axios.Cancel("NO_API_KEY_AVAILABLE"));
    }
    config.headers["X-API-KEY"] = apiKey;
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const originalReq = error.config;
    const code = error.response?.data?.errorCode;
    if (code === "TOKEN_EXPIRED" || error.response.status === 401) {
      if (!originalReq._retry) {
        originalReq._retry = true;
        if (!isRefreshing) {
          sessionStorage.removeItem("access_token");
          isRefreshing = true;
          return refreshToken()
            .then((newToken) => {
              sessionStorage.setItem("access_token", newToken);
              isRefreshing = false;
              queue.forEach((cb) => cb(newToken));
              queue = [];
              originalReq.headers.Authorization = `Bearer ${newToken}`;
              return api(originalReq);
            })
            .catch((err) => {
              queue = [];
              alert("hết phiên vui lòng đăng nhập lại");
              window.location.href = "/auth/login";
              return Promise.reject(err);
            });
        }
        return new Promise((resolve) => {
          queue.push((token) => {
            originalReq.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalReq));
          });
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
