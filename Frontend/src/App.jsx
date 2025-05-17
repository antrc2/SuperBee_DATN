// src/App.jsx
import { useRoutes } from "react-router-dom";
import Home from "@pages/Clients/Home/Home";
import adminRoutes from "@routers/Admin";

export default function App() {
  const routes = useRoutes([
    { path: "/", element: <Home /> },
    ...adminRoutes,
  ]);
  return routes;
}
