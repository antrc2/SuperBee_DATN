// Tạo file mới, ví dụ: src/components/common/ProtectedRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import { hasRequiredRole } from "@utils/tokenUtils";

const ProtectedRouteClient = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAllowed = hasRequiredRole(allowedRoles);
  if (!isAllowed) {
    localStorage.setItem("location", location.pathname);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRouteClient;
