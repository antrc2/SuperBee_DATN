import React from "react";
import Header from "../../../components/Client/layout/Header";
import Sidebar from "../../../components/Client/profile/Sidebar";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <div className=" ">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-6  ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
