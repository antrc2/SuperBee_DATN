import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div>
      <header>Header Login</header>
      <Outlet />
    </div>
  );
}
