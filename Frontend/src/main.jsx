// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Import các Providers cần thiết
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AppStatusProvider } from "./contexts/AppStatusContext.jsx"; // Import Provider mới
import { AuthProvider } from "./contexts/AuthContext.jsx"; // AuthProvider đã được tinh gọn

import "@styles/theme.css";

// Render ứng dụng React
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* ThemeProvider và NotificationProvider thường ở cấp cao nhất để có thể truy cập mọi nơi */}
      <ThemeProvider>
        <NotificationProvider>
          {/* AppStatusProvider cần chạy trước để xác định trạng thái sẵn sàng của ứng dụng */}
          <AppStatusProvider>
            {/* AuthProvider có thể nằm trong AppStatusProvider,
                vì nó không cần thông tin API key/domain để hoạt động */}
            <AuthProvider>
              <App /> {/* Component App chính của bạn */}
            </AuthProvider>
          </AppStatusProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
