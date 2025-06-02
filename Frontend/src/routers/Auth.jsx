import { Navigate } from "react-router-dom";
import { AuthLayout } from "@layouts";
import { authModules } from "./AuthModules";
import Login from "../pages/Auth/Login";

const authRoutes = [
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />
      },

      ...authModules.map((e) => {
        let View = e.view;
        return {
          path: e.path,
          element: <View />
        };
      }),

      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
];

export default authRoutes;
