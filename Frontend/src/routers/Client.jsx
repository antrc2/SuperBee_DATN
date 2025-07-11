import React, { Suspense } from "react"; // <-- Thêm Suspense
import { Navigate } from "react-router-dom";
import { HomeLayout, ProfileLayout } from "@layouts";
import { clientModules, profileModule } from "./ClientModules";
// import { Home, Profile } from "@pages"; // <-- Xóa dòng này, sẽ lazy load từ ClientModules
import ProtectedRouteClient from "../components/common/ProtectClient";
// import { NotFound } from "../pages"; // <-- Xóa dòng này, sẽ lazy load
// import Demo from "../pages/Chat/Chat"; // Xóa nếu ChatComponent đã được xử lý trong clientModules

// Lazy load NotFound và Home
const Home = React.lazy(() => import("@pages/Clients/Home/Home"));
const Profile = React.lazy(() => import("@pages/Clients/Profile/Profile"));
const NotFound = React.lazy(() => import("../pages/NotFound/NotFound"));

export const clientRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Đang tải Trang chủ...</div>}>
            {" "}
            {/* Thêm Suspense */}
            <Home />
          </Suspense>
        ),
      },

      // Áp dụng logic kiểm tra tại đây
      ...clientModules.map((e) => {
        const View = e.view;
        // Kiểm tra xem route có được đánh dấu 'requiresAuth' hay không
        const elementToRender = e.requiresAuth ? (
          <ProtectedRouteClient>
            <Suspense fallback={<div>Đang tải...</div>}>
              {" "}
              {/* Suspense cho các component được bảo vệ */}
              <View />
            </Suspense>
          </ProtectedRouteClient>
        ) : (
          <Suspense fallback={<div>Đang tải...</div>}>
            {" "}
            {/* Suspense cho các component không được bảo vệ */}
            <View />
          </Suspense>
        );

        return {
          path: e.path,
          element: elementToRender,
        };
      }),

      {
        path: "*",
        element: (
          <Suspense fallback={<div>Đang tải trang lỗi...</div>}>
            {" "}
            {/* Suspense cho NotFound */}
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
];

// Đối với profileRoutes
export const profileRoutes = [
  {
    path: "/info",
    element: (
      <ProtectedRouteClient>
        <ProfileLayout />
      </ProtectedRouteClient>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Đang tải Hồ sơ...</div>}>
            <Profile />
          </Suspense>
        ),
      },
      ...profileModule.map((e) => {
        const View = e.view;
        return {
          path: e.path,
          element: (
            <Suspense fallback={<div>Đang tải...</div>}>
              <View />
            </Suspense>
          ),
        };
      }),
      {
        path: "*",
        element: (
          <Suspense fallback={<div>Đang tải trang lỗi...</div>}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
];
