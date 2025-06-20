import React from "react";
import Header from "../../../components/Client/layout/Header";
import Sidebar from "../../../components/Client/profile/Sidebar";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <div className="bg-gradient-header0">
      <Header />
      <div className="min-h-screen flex max-w-7xl mx-auto mt-5 gap-5">
        <Sidebar />
        <main className="flex-1 overflow-auto ">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
