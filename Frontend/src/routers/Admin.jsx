/* eslint-disable no-unused-vars */
// src/routers/Admin.jsx

import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import { adminModules } from "@routers/adminModules";
import AppLayout from "@layouts/Admin/AppLayout";
import Home from "@pages/Admin/Dashboard/Home";
import ProtectedRoute from "@components/common/ProtectedRoute";
import { NotFound } from "../pages";
const adminRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      // cho mỗi module

      ...adminModules.map(
        // Lấy thêm `allowedRoles` từ mỗi module
        ({
          name,
          list: List,
          create: Create,
          edit: Edit,
          show: Show,
          allowedRoles,
        }) => ({
          path: name,
          // Bọc Outlet bằng ProtectedRoute và truyền `allowedRoles` vào
          element: (
            <ProtectedRoute allowedRoles={allowedRoles}>
              <Outlet />
            </ProtectedRoute>
          ),
          // Các route con bên trong sẽ được bảo vệ bởi Outlet ở trên
          children: [
            { index: true, element: <List /> },
            { path: "new", element: <Create /> },
            { path: ":id", element: <Show /> },
            { path: ":id/edit", element: <Edit /> },
            { path: "*", element: <NotFound /> },
          ],
        })
      ),
      // catch-all /admin/*
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default adminRoutes;
