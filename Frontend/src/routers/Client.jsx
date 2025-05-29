import { Navigate } from "react-router-dom";
import { HomeLayout, ProfileLayout } from "@layouts";
import { clientModules, profileModule } from "./ClientModules";
import { Home } from "@pages";
import { Profile } from "../pages";

export const clientRoutes = [
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

export const profileRoutes = [
  {
    path: "/info",
    element: <ProfileLayout />,
    children: [
      {
        index: true,
        element: <Profile />
      },

      // Các route con bên trong info nên dùng path tương đối, không có dấu "/"
      ...profileModule.map((e) => {
        const View = e.view;
        return {
          path: e.path, // index route
          element: <View />
        };
      }),

      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
];
