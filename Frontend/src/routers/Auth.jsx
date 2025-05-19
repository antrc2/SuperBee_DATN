import { Navigate } from "react-router-dom";
import { AuthLayout } from "@layouts";
import { authModules } from "./AuthModules";

const authRoutes = [
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <div className="text-center">Clients</div>
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
