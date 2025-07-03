// src/contexts/HomeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getHomeData, getNotification } from "../services/HomeService";
import { useQuery } from "@tanstack/react-query";
import LoadingDomain from "../components/Loading/LoadingDomain";
import ServerErrorDisplay from "../components/Loading/ServerErrorDisplay";
import { useAuth } from "./AuthContext";

const HomeContext = createContext();

export function HomeProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState({
    count: 0,
    notifications: [],
  });
  const {
    data: homeData,
    isLoading: isLoadingHome,
    isError: isErrorHome,
    error: errorHome,
  } = useQuery({
    queryKey: ["home"],
    queryFn: getHomeData,
    // enabled: true, // Luôn bật cho dữ liệu home
  });
  // Query cho dữ liệu Thông báo
  const {
    data: notificationData,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    error: errorNotifications,
  } = useQuery({
    queryKey: ["notifications", isLoggedIn], // Thêm isLoggedIn vào queryKey để re-fetch khi trạng thái đăng nhập thay đổi
    queryFn: getNotification,
  });
  useEffect(() => {
    if (!isLoadingNotifications) {
      const noti = [
        ...notificationData.global_notifications,
        ...notificationData.personal_notifications,
      ];
      const countNoti = noti.filter((e) => e.is_read === false);
      setNotifications({
        count: countNoti.length ?? 0,
        notifications: noti ?? [],
      });
    }
  }, [isLoadingNotifications, isLoggedIn, notificationData]);
  // Xử lý trạng thái loading tổng thể
  if (isLoadingHome || isLoadingNotifications) {
    return <LoadingDomain />;
  }

  // Xử lý trạng thái lỗi tổng thể
  if (isErrorHome) {
    return (
      <ServerErrorDisplay statusCode={errorHome.response?.status || 500} />
    );
  }
  if (isErrorNotifications && isLoggedIn) {
    // Chỉ hiển thị lỗi thông báo nếu người dùng đã đăng nhập
    return (
      <ServerErrorDisplay
        statusCode={errorNotifications.response?.status || 500}
      />
    );
  }

  console.log("🚀 ~ HomeProvider ~ notifications:", notifications);
  return (
    <HomeContext.Provider value={{ homeData, notifications, setNotifications }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}
