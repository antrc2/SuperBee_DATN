// src/App.jsx
import { useRoutes } from "react-router-dom";
import adminRoutes from "@routers/Admin";
import clientRoutes from "./routers/Client";
import authRoutes from "./routers/Auth";
import { useFetch } from "./utils/hook";
import LoadingDomain from "./components/Loading/LoadingDomain";
import { ActiveDomain } from "./pages";

export default function App() {
  const { data, loading, error } = useFetch("/domain", "get");
  const routes = useRoutes([...authRoutes, ...clientRoutes, ...adminRoutes]);

  if (loading) return <LoadingDomain />;

  if (error) {
    const code = error?.response?.data?.code;
    if (code === "NO_ACTIVE") {
      return <ActiveDomain />;
    }
  }

  return routes;
}
