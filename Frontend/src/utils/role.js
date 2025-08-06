import { useMemo } from "react"; // Thêm import useMemo
import { usePermissions } from "@utils/usePermissions.js";

// Custom hook to get roles
export function useRoles() {
  const { hasRole } = usePermissions();

  // Lấy tất cả các giá trị boolean ra trước
  const admin = hasRole("admin");
  const admin_super = hasRole("admin-super");
  const reseller = hasRole("reseller");
  const partner = hasRole("partner");
  const ke_toan = hasRole("ke-toan");
  const nv_ho_tro = hasRole("nv-ho-tro");
  const nv_marketing = hasRole("nv-marketing");
  const nv_kiem_duyet = hasRole("nv-kiem-duyet");

  // Chỉ tạo lại object khi một trong các giá trị quyền thay đổi
  return useMemo(
    () => ({
      admin,
      admin_super,
      reseller,
      partner,
      ke_toan,
      nv_ho_tro,
      nv_marketing,
      nv_kiem_duyet,
    }),
    [
      admin,
      admin_super,
      reseller,
      partner,
      ke_toan,
      nv_ho_tro,
      nv_marketing,
      nv_kiem_duyet,
    ]
  );
}
