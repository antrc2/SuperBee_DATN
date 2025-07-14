/* eslint-disable no-unused-vars */
// src/routers/Admin.jsx

import React, { Suspense } from "react"; // <-- Thêm React và Suspense
import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import { adminModules } from "@routers/adminModules";
import AppLayout from "@layouts/Admin/AppLayout";
// import Home from "@pages/Admin/Dashboard/Home"; // <-- Xóa dòng này
import ProtectedRoute from "@components/common/ProtectedRoute";
import { ThemeProvider } from "../contexts/ThemeContext";
// import { NotFound } from "../pages"; // <-- Xóa dòng này

// Lazy load Home và NotFound
const Home = React.lazy(() => import("@pages/Admin/Dashboard/Home"));
const NotFound = React.lazy(() => import("../pages/NotFound/NotFound"));

const adminRoutes = [
  {
    path: "/admin",
    element: (
      <ThemeProvider>
        <ProtectedRoute allowedRoles={["admin"]}>
          <AppLayout />
        </ProtectedRoute>
      </ThemeProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Đang tải Dashboard Admin...</div>}>
            {" "}
            {/* Suspense cho Home */}
            <Home />
          </Suspense>
        ),
      },
      // cho mỗi module

      ...adminModules.map(
        ({
          name,
          list: List,
          create: Create,
          edit: Edit,
          show: Show,
          allowedRoles,
        }) => ({
          path: name,
          element: (
            <ProtectedRoute allowedRoles={allowedRoles}>
              <Outlet />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<div>Đang tải danh sách...</div>}>
                  <List />
                </Suspense>
              ),
            },
            {
              path: "new",
              element: (
                <Suspense fallback={<div>Đang tải trang tạo mới...</div>}>
                  <Create />
                </Suspense>
              ),
            },
            {
              path: ":id",
              element: (
                <Suspense fallback={<div>Đang tải chi tiết...</div>}>
                  <Show />
                </Suspense>
              ),
            },
            {
              path: ":id/edit",
              element: (
                <Suspense fallback={<div>Đang tải trang chỉnh sửa...</div>}>
                  <Edit />
                </Suspense>
              ),
            },
            {
              path: "*",
              element: (
                <Suspense fallback={<div>Đang tải trang lỗi...</div>}>
                  <NotFound />
                </Suspense>
              ),
            },
          ],
        })
      ),
      // catch-all /admin/*
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

export default adminRoutes;
