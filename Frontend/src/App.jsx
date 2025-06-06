// src/App.jsx
import { useRoutes } from "react-router-dom";
import adminRoutes from "@routers/Admin";
import { clientRoutes, profileRoutes } from "./routers/Client";
import authRoutes from "./routers/Auth";
import AuthContext from "./contexts/AuthContex";
import CheckDomain from "./utils/checkDomain";
import { useContext } from "react";
import { ScrollToTop } from "./components/Admin/common/ScrollToTop";

export default function App() {
  const { apiKey } = useContext(AuthContext);
  !apiKey && <CheckDomain />;
  <ScrollToTop />;
  const routes = useRoutes([
    ...authRoutes,
    ...clientRoutes,
    ...adminRoutes,
    ...profileRoutes
  ]);
  return routes;
}
