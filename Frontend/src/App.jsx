// src/App.jsx
import React from "react";
import { useRoutes } from "react-router-dom";
import adminRoutes from "@routers/Admin";
import { clientRoutes, profileRoutes } from "@routers/Client";
import authRoutes from "@routers/Auth";

import { ScrollToTop } from "@components/Admin/common/ScrollToTop";
import { useAuth } from "./contexts/AuthContext";
import LoadingDomain from "./components/Loading/LoadingDomain";
import ActivateNotice from "./components/Loading/ActivateNotice";
import ErrorPage from "./pages/Error/ErrorPage";
import ActiveDomain from "./pages/Clients/ActiveDomain/ActiveDomain";

function AppRoutes() {
  const { authStatus, combinedError, enterKey, retryDomain } = useAuth();
  const appRoutes = useRoutes([
    ...authRoutes,
    ...clientRoutes,
    ...adminRoutes,
    ...profileRoutes
  ]);

  switch (authStatus) {
    case "loading_key":
      return <LoadingDomain message="Đang kiểm tra API key..." />;

    case "needs_key":
      // Chưa có key → chuyển sang form nhập thủ công
      return <ActiveDomain />;

    case "ready_check_domain":
      return <LoadingDomain message="Đang kiểm tra trạng thái kích hoạt…" />;

    // chưa kích hoạt
    case "needs_activation":
      return (
        <ActiveDomain onRetry={retryDomain} errorMessage={combinedError} />
      );

    case "invalid_key":
      // Key sai → xuất ErrorPage, nút retry quay về nhập lại key
      return (
        <ErrorPage
          message={`API Key không hợp lệ.\n${combinedError}`}
          onRetry={() => enterKey("")} // reset key, dẫn đến needs_key
        />
      );

    case "error":
      // Lỗi chung (404 /domain, network, v.v.)
      return <ErrorPage message={`Lỗi hệ thống:\n${combinedError}`} />;

    case "app_ready":
      // Domain active, API key ok → render phần chính của app (Route)
      return (
        <div>
          <ScrollToTop />
          {appRoutes}
        </div>
      );

    default:
      return <LoadingDomain message="Đang khởi tạo..." />;
  }
}

export default function App() {
  return <AppRoutes />;
}
