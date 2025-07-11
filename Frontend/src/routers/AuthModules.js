import React from "react"; // <-- Thêm dòng này

const Login = React.lazy(() => import("@pages/Auth/Login"));
const Register = React.lazy(() => import("@pages/Auth/Register"));

export const authModules = [
  {
    path: "login",
    view: Login,
  },
  {
    path: "register",
    view: Register,
  },
];
