/* eslint-disable no-unused-vars */
// src/routers/Admin.jsx

import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import AdminLayout from "@layouts/Admin/AdminLayout";
import { adminModules } from "@routers/adminModules";

const adminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <div className="text-center">Admin Dashboard</div>
      },
      // cho mỗi module

      ...adminModules.map(
        ({ name, list: List, create: Create, edit: Edit }) => ({
          path: name,
          element: <Outlet />, // nested
          children: [
            { index: true, element: <List /> },
            { path: "new", element: <Create /> },
            { path: ":id/edit", element: <Edit /> },
            { path: "*", element: <Navigate to={`/admin/${name}`} replace /> }
          ]
        })
      ),

      // catch-all /admin/*
      { path: "*", element: <Navigate to="/admin" replace /> }
    ]
  }
];

export default adminRoutes;
