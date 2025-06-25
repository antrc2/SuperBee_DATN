// src/routers/Client.jsx

import { Navigate } from "react-router-dom";
import { HomeLayout, ProfileLayout } from "@layouts";
import { clientModules, profileModule } from "./ClientModules";
import { Home, Profile } from "@pages";
import ProtectedRouteClient from "../components/common/ProtectClient";
import { NotFound } from "../pages";
import Demo from "../pages/Chat/Chat";

export const clientRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Demo />,
      },

      // Áp dụng logic kiểm tra tại đây
      ...clientModules.map((e) => {
        const View = e.view;
        // Kiểm tra xem route có được đánh dấu 'requiresAuth' hay không
        const elementToRender = e.requiresAuth ? (
          <ProtectedRouteClient>
            <View />
          </ProtectedRouteClient>
        ) : (
          <View />
        );

        return {
          path: e.path,
          element: elementToRender,
        };
      }),

      { path: "*", element: <NotFound /> },
    ],
  },
];

// Đối với profileRoutes, vì TẤT CẢ đều cần đăng nhập, có một cách làm sạch hơn
export const profileRoutes = [
  {
    path: "/info",
    // Bọc cả layout chung bằng ProtectedRoute
    // Bất kỳ ai muốn vào /info/* đều phải đăng nhập trước
    element: (
      <ProtectedRouteClient>
        <ProfileLayout />
      </ProtectedRouteClient>
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
      ...profileModule.map((e) => {
        const View = e.view;
        return {
          path: e.path,
          element: <View />,
        };
      }),
      { path: "*", element: <NotFound /> },
    ],
  },
];
