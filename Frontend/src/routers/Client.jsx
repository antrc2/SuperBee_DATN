import { Navigate } from "react-router-dom";
import { HomeLayout } from "@layouts";
import { clientModules } from "./ClientModules";
import { Home } from "@pages";

const clientRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },

      ...clientModules.map((e) => {
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

export default clientRoutes;
