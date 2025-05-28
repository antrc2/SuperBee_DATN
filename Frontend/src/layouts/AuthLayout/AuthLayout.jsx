import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Client/layout/Header";
export default function AuthLayout() {
  return (
    <div>
      <header>
        <Header />
      </header>
      <Outlet />
    </div>
  );
}
