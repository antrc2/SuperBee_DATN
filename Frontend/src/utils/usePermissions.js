import { useCallback } from "react"; // <-- Thêm import này
import { useAuth } from "../contexts/AuthContext";

export const usePermissions = () => {
  const { roles, permissions } = useAuth();

  // Sử dụng useCallback để ổn định hàm `can`
  const can = useCallback(
    (permissionName) => {
      if (!permissions) return false;
      return permissions.includes(permissionName);
    },
    [permissions]
  ); // <-- Chỉ tạo lại hàm `can` khi `permissions` thay đổi

  // Tương tự, nên bọc cả hàm hasRole nếu bạn dùng nó trong useEffect ở đâu đó
  const hasRole = useCallback(
    (roleName) => {
      if (!roles) return false;
      return Array.isArray(roleName)
        ? roleName.some((r) => roles.includes(r))
        : roles.includes(roleName);
    },
    [roles]
  ); // <-- Chỉ tạo lại hàm `hasRole` khi `roles` thay đổi

  return { can, hasRole, roles, permissions };
};
