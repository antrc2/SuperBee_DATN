import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/http";
import { Link } from "react-router-dom";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

const API_URL = "/admin/authorization/permissions";

// --- Form tạo/sửa Permission (ĐÃ ĐƯỢC COMMENT LẠI) ---
/*
function PermissionForm({ permission, onSave, onCancel, groups }) {
  // ... (Nội dung form giữ nguyên trong comment)
}
*/

// --- Modal xác nhận xóa (ĐÃ ĐƯỢC COMMENT LẠI) ---
/*
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  // ... (Nội dung modal giữ nguyên trong comment)
}
*/

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState(""); // Comment lại vì không còn thao tác sửa/xóa

  // --- CÁC STATE VÀ HÀM CHO VIỆC SỬA/XÓA ĐÃ ĐƯỢC COMMENT LẠI ---
  // const [editingPermission, setEditingPermission] = useState(null);
  // const [permissionToDelete, setPermissionToDelete] = useState(null);

  /*
  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };
  */

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(API_URL);
      if (response.data.status) {
        setPermissions(response.data.data);
      } else {
        setError(response.data.message || "Không thể tải danh sách quyền.");
      }
    } catch (err) {
      setError(
        "Lỗi máy chủ: " +
          (err.response?.data?.message || "Không thể tải danh sách quyền.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // --- HÀM LƯU VÀ XÓA ĐÃ ĐƯỢC COMMENT LẠI ---
  /*
  const handleSavePermission = async (data) => {
    // ...
  };
  const confirmDelete = async () => {
    // ...
  };
  */

  if (isLoading) return <LoadingDomain />;

  const permissionGroups = Object.keys(permissions);

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
          Quyền Hệ Thống
        </h1>
        <Link
          to="/admin/authorization"
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors self-start sm:self-center"
        >
          &larr; Về Dashboard
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* --- FORM SỬA ĐÃ ĐƯỢC COMMENT LẠI ---
      {editingPermission && (
        <PermissionForm
          permission={editingPermission}
          onSave={handleSavePermission}
          onCancel={() => setEditingPermission(null)}
          groups={permissionGroups}
        />
      )}
      */}

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Quyền
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Mô tả
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Guard
              </th>
              {/* <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
              */}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {permissionGroups.length > 0 ? (
              permissionGroups.map((groupName) => (
                <React.Fragment key={groupName}>
                  <tr className="bg-gray-100 dark:bg-gray-700/80">
                    <td
                      colSpan={3} // Giảm colSpan vì đã bỏ cột Hành động
                      className="px-6 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100"
                    >
                      Nhóm: {groupName}
                    </td>
                  </tr>
                  {permissions[groupName].map((permission) => (
                    <tr
                      key={permission.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                          {permission.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300">
                          {permission.guard_name || "api"}
                        </span>
                      </td>
                      {/* --- CÁC NÚT SỬA/XÓA ĐÃ ĐƯỢC COMMENT LẠI ---
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            setEditingPermission({ ...permission })
                          }
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => setPermissionToDelete(permission)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                      */}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  Chưa có quyền nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL XÓA ĐÃ ĐƯỢC COMMENT LẠI ---
      <ConfirmationModal
        isOpen={!!permissionToDelete}
        onClose={() => setPermissionToDelete(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa quyền"
        message={`Bạn có chắc chắn muốn xóa quyền "${permissionToDelete?.name}"?`}
      />
      */}
    </div>
  );
}
