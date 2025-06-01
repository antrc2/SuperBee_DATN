// src/layouts/AdminLayout.jsx
import React from "react";
import Header from "@components/Admin/layouts/Header";
import Footer from "@components/Admin/layouts/Footer";
import Sidebar from "@components/Admin/layouts/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
