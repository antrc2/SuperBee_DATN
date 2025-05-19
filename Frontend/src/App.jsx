// src/App.jsx
import { useRoutes } from "react-router-dom";
import adminRoutes from "@routers/Admin";
import clientRoutes from "./routers/Client";
import authRoutes from "./routers/Auth";

export default function App() {
  const routes = useRoutes([...authRoutes, ...clientRoutes, ...adminRoutes]);
  return routes;
}
