// Tạo file mới, ví dụ: src/components/common/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { hasRequiredRole } from "@utils/tokenUtils";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAllowed = hasRequiredRole(allowedRoles);

  if (!isAllowed) {
    return <Navigate to="/not-authorized" replace />;
  }
  return children;
};

export default ProtectedRoute;
