// src/App.jsx

// Các Context Providers sẽ được render có điều kiện
import { CartProvider } from "./contexts/CartContext.jsx";
import { HomeProvider } from "./contexts/HomeContext.jsx";
import { ChatProvider } from "./contexts/ChatContext.jsx";
import { useRoutes } from "react-router-dom";
import adminRoutes from "@routers/Admin";
import { clientRoutes, profileRoutes } from "@routers/Client";
import authRoutes from "@routers/Auth";
import partnerRoutes from "./routers/Partner.jsx";

import { ScrollToTop } from "@components/Admin/common/ScrollToTop";
import { useAppStatus } from "@contexts/AppStatusContext";
import LoadingDomain from "./components/Loading/LoadingDomain";
import ErrorPage from "./pages/Error/ErrorPage";
import ActiveDomain from "./pages/Clients/ActiveDomain/ActiveDomain";
import { NotificationListenerProvider } from "./contexts/Notification.jsx";

function AppRoutes() {
  // Lấy trạng thái khởi tạo ứng dụng và các hàm liên quan từ AppStatusContext
  const { appInitStatus, combinedError, enterKey, retryDomain, isLoading } =
    useAppStatus();

  // Định nghĩa các routes của ứng dụng
  const appRoutes = useRoutes([
    ...authRoutes,
    ...clientRoutes,
    ...adminRoutes,
    ...partnerRoutes,
    ...profileRoutes,
  ]);

  if (isLoading) {
    return <LoadingDomain message="Đang khởi động ứng dụng..." />;
  }

  switch (appInitStatus) {
    case "needs_key":
      return <ActiveDomain />;

    case "needs_activation":
      return (
        <ActiveDomain onRetry={retryDomain} errorMessage={combinedError} />
      );

    case "invalid_key":
      // API key không hợp lệ
      return (
        <ErrorPage
          message={`API Key không hợp lệ.\n${combinedError}`}
          onRetry={() => enterKey("")}
        />
      );

    case "error":
      return <ErrorPage message={`Lỗi hệ thống:\n${combinedError}`} />;

    case "app_ready":
      return (
        <HomeProvider>
          <ChatProvider>
            <CartProvider>
              <NotificationListenerProvider>
                <div>
                  <ScrollToTop />
                  {appRoutes}
                </div>
              </NotificationListenerProvider>
            </CartProvider>
          </ChatProvider>
        </HomeProvider>
      );
    default:
      return <LoadingDomain message="Đang khởi tạo ứng dụng..." />;
  }
}

export default function App() {
  return <AppRoutes />;
}
