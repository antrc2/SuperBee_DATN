// src/App.jsx
import { useRoutes } from "react-router-dom";
import adminRoutes from "@routers/Admin";
import clientRoutes from "./routers/Client";
import authRoutes from "./routers/Auth";
import { useGet } from "./utils/hook";
import LoadingDomain from "./components/Loading/LoadingDomain";
import { ActiveDomain, NotFound } from "./pages";
import AuthContext from "./contexts/AuthContex";
export default function App() {
  const { loading, error } = useGet("/domain");
  const routes = useRoutes([...authRoutes, ...clientRoutes, ...adminRoutes]);

  if (loading) return <LoadingDomain />;

  if (error) {
    const code = error?.response?.data?.code;
    if (code === "NO_ACTIVE") {
      return <ActiveDomain />;
    } else if (code === "NO_API_KEY") {
      return <NotFound />;
    }
  }

  return routes;
}
