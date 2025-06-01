/* eslint-disable no-unused-vars */
// src/routers/Admin.jsx

import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import { adminModules } from "@routers/adminModules";
import AppLayout from "@layouts/Admin/AppLayout";
import Home from "@pages/Admin/Dashboard/Home";
import NotFound from "@pages/Admin/OtherPage/NotFound";
const adminRoutes = [
  {
    path: "/admin",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />
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
            { path: "*", element: <NotFound /> }
          ]
        })
      ),

      // catch-all /admin/*
      { path: "*", element: <NotFound /> }
    ]
  }
];

export default adminRoutes;
