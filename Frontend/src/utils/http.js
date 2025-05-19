import axios from "axios";
import { refreshToken } from "./refreshToken.js";
import { getApiKey } from "./hook.js";
import { runAfter3Seconds } from "./time.js";

const defaultConfig = {
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10_000
};

const api = axios.create(defaultConfig);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    const apiKey = getApiKey();

    if (!apiKey) {
      // Ném lỗi sẽ được catch ở tầng gọi API
      const reload = () => {
        window.location.reload();
      };
      runAfter3Seconds(reload, 100);
      // throw new axios.Cancel("NO_API_KEY");
    }
    config.headers.Authorization = `Bearer ${apiKey}`;
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

);

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