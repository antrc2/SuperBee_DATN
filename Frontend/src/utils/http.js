import axios from "axios";
import { refreshToken } from "./refreshToken.js";
import { getApiKey } from "./hook.js";
import { showError } from "./notification.js";

const defaultConfig = {
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10_000
};

const authFreePaths = [
  "auth/login",
  "auth/register",
  "auth/refresh",
  "domain",
  "domain/register"
];
const api = axios.create(defaultConfig);

api.interceptors.request.use((config) => {
  const path = config.url.replace(/^\//, "");
  if (!authFreePaths.some((p) => path.startsWith(p))) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Ném lỗi sẽ được catch ở tầng gọi API
      throw new axios.Cancel("NO_ACCESS_TOKEN");
    }

    config.headers.Authorization = `Bearer ${token}`;
  }
  const apiKey = getApiKey();

  if (!apiKey) {
    // Ném lỗi sẽ được catch ở tầng gọi API
    showError("Server đang lỗi vui lòng thử lại sau 100d");

    throw new axios.Cancel("NO_API_KEY");
  }
  config.headers.ShopKey = `KEY ${apiKey}`;
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const originalReq = error.config;
    const code = error.response?.data?.errorCode;
    if (code === "TOKEN_EXPIRED" && error.response.status === 401) {
      if (!originalReq._retry) {
        originalReq._retry = true;
        if (!isRefreshing) {
          isRefreshing = true;
          return refreshToken()
            .then((newToken) => {
              localStorage.setItem("accessToken", newToken);
              isRefreshing = false;
              queue.forEach((cb) => cb(newToken));
              queue = [];
              originalReq.headers.Authorization = `Bearer ${newToken}`;
              return api(originalReq);
            })
            .catch((err) => {
              queue = [];
              window.location.href = "/login";
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
