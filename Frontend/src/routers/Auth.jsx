import React, { Suspense } from "react"; // <-- Thêm React và Suspense
import { Navigate } from "react-router-dom";
import { AuthLayout } from "@layouts";
import { authModules } from "./AuthModules";
// import Login from "../pages/Auth/Login"; // <-- Xóa dòng này
import ProtectAuth from "../components/common/ProtectAuth";
import { ClientThemeProvider } from "../contexts/ClientThemeContext";

// Lazy load Login
const Login = React.lazy(() => import("../pages/Auth/Login"));

const authRoutes = [
  {
    path: "/auth",
    element: (
      <ClientThemeProvider>
        <ProtectAuth>
          <AuthLayout />
        </ProtectAuth>
      </ClientThemeProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Đang tải Đăng nhập...</div>}>
            {" "}
            {/* Suspense cho Login */}
            <Login />
          </Suspense>
        ),
      },

      ...authModules.map((e) => {
        let View = e.view;
        return {
          path: e.path,
          element: (
            <Suspense fallback={<div>Đang tải...</div>}>
              {" "}
              {/* Suspense cho từng trang auth */}
              <View />
            </Suspense>
          ),
        };
      }),

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export default authRoutes;
