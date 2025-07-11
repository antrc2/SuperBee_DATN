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
      // Thời gian này hợp lý cho hầu hết các ứng dụng CRUD.
      staleTime: 1000 * 60 * 5, // 5 phút

      // Dữ liệu sẽ bị xóa khỏi cache sau 1 giờ nếu không có component nào đang sử dụng nó.
      // Giúp giải phóng bộ nhớ nhưng vẫn giữ dữ liệu đủ lâu để tái sử dụng.
      cacheTime: 1000 * 60 * 60, // 1 giờ

      // Mặc định, React Query sẽ tự động fetch lại dữ liệu khi cửa sổ trình duyệt được focus.
      // Rất hữu ích để đảm bảo dữ liệu luôn cập nhật khi người dùng quay lại ứng dụng.
      refetchOnWindowFocus: true,

      // KHÔNG tự động fetch lại khi component được mount.
      // Đây là thay đổi quan trọng nhất để tránh các cuộc gọi API không cần thiết
      // khi người dùng điều hướng giữa các trang hoặc các component được render lại.
      refetchOnMount: false,

      // Mặc định, React Query sẽ tự động fetch lại dữ liệu khi mạng được kết nối lại.
      // Giúp ứng dụng phục hồi mượt mà sau khi mất kết nối.
      refetchOnReconnect: true,

      // Nếu một query bị lỗi, nó sẽ được thử lại 3 lần.
      // Giá trị mặc định này cung cấp khả năng phục hồi tốt hơn trước các lỗi mạng hoặc API tạm thời,
      // so với việc chỉ thử lại 1 lần.
      retry: 3,
    },
    mutations: {
      // Các tùy chọn mặc định cho mutation (ví dụ: xử lý lỗi chung)
      // Có thể thêm onError, onSuccess tại đây nếu cần xử lý chung cho tất cả mutation.
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
