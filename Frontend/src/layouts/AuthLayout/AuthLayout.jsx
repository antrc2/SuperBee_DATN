import React from "react";
import GridShape from "@components/Admin/common/GridShape";
import { Link, Outlet } from "react-router";
import ThemeTogglerTwo from "@components/Admin/common/ThemeTogglerTwo";
import BgLogin from "@assets/tn/bg-l.jpeg";
export default function AuthLayout() {
  return (
    <div
      className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 object-fit-contain "
      style={{
        backgroundImage: `url(${BgLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        <Outlet />
        <div className={`items-center hidden w-full h-full lg:w-1/2  lg:grid`}>
          <div className="relative flex items-center justify-center z-1"></div>
        </div>
      </div>
    </div>
  );
}
