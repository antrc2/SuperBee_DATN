// src/hooks/usePermissions.js
import { useAuth } from "@contexts/AuthContext";

export const usePermissions = () => {
  const { roles, permissions } = useAuth();

  // Kiểm tra quyền
  const can = (permissionName) => {
    if (!permissions) return false;
    return permissions.includes(permissionName);
  };

  // Kiểm tra vai trò
  const hasRole = (roleName) => {
    if (!roles) return false;
    return Array.isArray(roleName)
      ? roleName.some((r) => roles.includes(r))
      : roles.includes(roleName);
  };

  return { can, hasRole, roles, permissions };
};
