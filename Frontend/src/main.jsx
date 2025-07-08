// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Import các Providers cần thiết
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AppStatusProvider } from "./contexts/AppStatusContext.jsx"; // Import Provider mới
import { AuthProvider } from "./contexts/AuthContext.jsx"; // AuthProvider đã được tinh gọn

import "@styles/theme.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dữ liệu được coi là "stale" sau 5 phút. Sau thời gian này, React Query
      // sẽ fetch lại trong nền nếu có component nào yêu cầu dữ liệu đó.
      staleTime: 1000 * 60 * 5, // 5 phút

      // Dữ liệu sẽ bị xóa khỏi cache sau 1 giờ nếu không có component nào đang sử dụng nó (observer = 0)
      cacheTime: 1000 * 60 * 60, // 1 giờ

      // Mặc định, React Query sẽ tự động fetch lại dữ liệu khi cửa sổ trình duyệt được focus
      refetchOnWindowFocus: true,

      // Mặc định, React Query sẽ tự động fetch lại dữ liệu khi component được mount (render lần đầu)
      refetchOnMount: true,

      // Mặc định, React Query sẽ tự động fetch lại dữ liệu khi mạng được kết nối lại
      refetchOnReconnect: true,

      // Nếu một query bị lỗi, nó sẽ được thử lại 3 lần theo mặc định (với khoảng thời gian tăng dần)
      retry: 1,
    },
    mutations: {
      // Các tùy chọn mặc định cho mutation (ví dụ: xử lý lỗi chung)
    },
  },
});
// Render ứng dụng React
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NotificationProvider>
            <AppStatusProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </AppStatusProvider>
          </NotificationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
