// src/routers/Client.jsx

import { Navigate } from "react-router-dom";
import { HomeLayout, ProfileLayout } from "@layouts";
import { clientModules, profileModule } from "./ClientModules";
import { Home, Profile } from "@pages";
import ProtectedRoute from "@components/common/ProtectedRoute"; // Import component bảo vệ

export const clientRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },

      // Áp dụng logic kiểm tra tại đây
      ...clientModules.map((e) => {
        const View = e.view;
        // Kiểm tra xem route có được đánh dấu 'requiresAuth' hay không
        const elementToRender = e.requiresAuth ? (
          // Nếu có, bọc View trong ProtectedRoute
          <ProtectedRoute>
            <View />
          </ProtectedRoute>
        ) : (
          // Nếu không, giữ nguyên
          <View />
        );

        return {
          path: e.path,
          element: elementToRender,
        };
      }),

      { path: "*", element: <Navigate to="/" replace /> },
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
      <ProtectedRoute>
        <ProfileLayout />
      </ProtectedRoute>
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
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
