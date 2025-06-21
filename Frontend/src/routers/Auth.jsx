import { Navigate } from "react-router-dom";
import { AuthLayout } from "@layouts";
import { authModules } from "./AuthModules";
import Login from "../pages/Auth/Login";
import ProtectAuth from "../components/common/ProtectAuth";

const authRoutes = [
  {
    path: "/auth",
    element: (
      <ProtectAuth>
        <AuthLayout />
      </ProtectAuth>
    ),
    children: [
      {
        index: true,
        element: <Login />,
      },

      ...authModules.map((e) => {
        let View = e.view;
        return {
          path: e.path,
          element: <View />,
        };
      }),

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

export default authRoutes;
