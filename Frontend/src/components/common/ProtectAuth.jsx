import React from "react";
import { Navigate } from "react-router-dom";
import { getDecodedToken } from "../../utils/tokenUtils";

export default function ProtectAuth({ children }) {
  const isAllowed = getDecodedToken();
  if (isAllowed) {
    return <Navigate to="/" replace />;
  }
  return children;
}
