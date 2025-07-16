import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/http";

const API_ROLES_URL = "/admin/authorization/roles";
const API_PERMISSIONS_URL = "/admin/authorization/permissions";

// --- [MỚI] Component Form để tạo/sửa Role ---
function RoleForm({ role, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (role) {
      setName(role.name || "");
      setDescription(role.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: role?.id, name, description });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {role ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="roleName"
            className="block text-sm font-medium text-gray-700"
          >
            Tên vai trò (không dấu, không khoảng trắng)
          </label>
          <input
            id="roleName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="vi-du: sales_manager"
            required
          />
        </div>
        <div>
          <label
            htmlFor="roleDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Mô tả
          </label>
          <input
            id="roleDescription"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Mô tả ngắn về vai trò này"
          />
        </div>
        <div className="flex justify-end gap-2">
          {role && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {role ? "Lưu thay đổi" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Các component Modal và PermissionGroup giữ nguyên như cũ ---
function PermissionGroup({
  groupName,
  permissions,
  selectedPermissions,
  onCheckboxChange,
  onSelectAllChange,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const allPermissionsInGroup = permissions.map((p) => p.name);
  const isAllSelected =
    allPermissionsInGroup.length > 0 &&
    allPermissionsInGroup.every((p) => selectedPermissions.includes(p));
  return (
    <div className="border border-gray-200 rounded-md mb-2">
      <div
        className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
            checked={isAllSelected}
            onChange={(e) =>
              onSelectAllChange(allPermissionsInGroup, e.target.checked)
            }
            onClick={(e) => e.stopPropagation()}
          />
          <h3 className="font-semibold text-gray-700">{groupName}</h3>
        </div>
        <span
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>
      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center">
              <input
                id={`perm-${permission.id}`}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={selectedPermissions.includes(permission.name)}
                onChange={() => onCheckboxChange(permission.name)}
              />
              <label
                htmlFor={`perm-${permission.id}`}
                className="ml-2 block text-sm text-gray-900 font-mono"
              >
                {permission.description ||
                  permission.name.split(".")[1] ||
                  permission.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function AssignPermissionsModal({
  role,
  allPermissions,
  onClose,
  onSave,
  isSaving,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  useEffect(() => {
    if (role && role.permissions) {
      setSelectedPermissions(role.permissions.map((p) => p.name));
    }
  }, [role]);
  const handleCheckboxChange = (permissionName) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };
  const handleSelectAllForGroup = (groupPermissions, isSelected) => {
    setSelectedPermissions((prev) => {
      const otherPermissions = prev.filter(
        (p) => !groupPermissions.includes(p)
      );
      return isSelected
        ? [...otherPermissions, ...groupPermissions]
        : otherPermissions;
    });
  };
  const handleSave = () => {
    onSave(role.id, selectedPermissions);
  };
  if (!role) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Gán quyền cho vai trò:{" "}
          <span className="text-indigo-600">{role.name}</span>
        </h2>
        <div className="flex-grow overflow-y-auto pr-2 border-t border-b py-4">
          {Object.entries(allPermissions).map(([groupName, permissions]) => (
            <PermissionGroup
              key={groupName}
              groupName={groupName}
              permissions={permissions}
              selectedPermissions={selectedPermissions}
              onCheckboxChange={handleCheckboxChange}
              onSelectAllChange={handleSelectAllForGroup}
            />
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-auto pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [roleToAssign, setRoleToAssign] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get(API_ROLES_URL),
        api.get(API_PERMISSIONS_URL),
      ]);

      if (rolesRes.data.status) {
        setRoles(rolesRes.data.data);
      } else {
        setError(rolesRes.data.message || "Không thể tải danh sách vai trò.");
      }

      if (permissionsRes.data.status) {
        setAllPermissions(permissionsRes.data.data);
      } else {
        setError(
          permissionsRes.data.message || "Không thể tải danh sách quyền."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveRole = async ({ id, name, description }) => {
    setSuccess("");
    setError("");
    const isEditing = !!id;
    const url = isEditing ? `${API_ROLES_URL}/${id}` : API_ROLES_URL;

    const formData = new FormData();
    formData.append("name", name);
    if (description) {
      formData.append("description", description);
    }
    if (isEditing) {
      formData.append("_method", "PUT");
    }

    try {
      const res = await api.post(url, formData);
      if (res.data.status) {
        setSuccess(res.data.message);
        setEditingRole(null);
        fetchData();
      } else {
        setError(res.data.message || "Đã có lỗi xảy ra.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Lỗi khi ${isEditing ? "cập nhật" : "tạo"} vai trò.`
      );
    } finally {
      clearMessages();
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setSuccess("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("_method", "DELETE");
      const res = await api.post(
        `${API_ROLES_URL}/${roleToDelete.id}`,
        formData
      );

      if (res.data.status) {
        setSuccess(res.data.message);
        fetchData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xóa vai trò.");
    } finally {
      setRoleToDelete(null);
      clearMessages();
    }
  };

  const handleSavePermissions = async (roleId, permissions) => {
    setIsSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await api.post(`${API_ROLES_URL}/${roleId}/permissions`, {
        permissions,
      });
      if (res.data.status) {
        setSuccess(res.data.message);
        setRoleToAssign(null);
        fetchData();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gán quyền cho vai trò.");
    } finally {
      setIsSaving(false);
      clearMessages();
    }
  };

  if (isLoading)
    return (
      <div className="text-center p-8 animate-pulse">Đang tải dữ liệu...</div>
    );

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Quản lý Vai trò (Roles)
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {success}
        </div>
      )}

      <RoleForm
        role={editingRole}
        onSave={handleSaveRole}
        onCancel={() => setEditingRole(null)}
      />

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quyền hạn
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {role.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {role.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {role.permissions.length > 0 ? (
                      role.permissions.slice(0, 5).map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                        >
                          {p.name.split(".")[1] || p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">
                        Chưa có quyền
                      </span>
                    )}
                    {role.permissions.length > 5 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">
                        +{role.permissions.length - 5}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setRoleToAssign(role)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Gán quyền
                  </button>
                  <button
                    onClick={() => setEditingRole(role)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setRoleToDelete(role)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roleToAssign && (
        <AssignPermissionsModal
          role={roleToAssign}
          allPermissions={allPermissions}
          onClose={() => setRoleToAssign(null)}
          onSave={handleSavePermissions}
          isSaving={isSaving}
        />
      )}
      <ConfirmationModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={confirmDeleteRole}
        title="Xác nhận xóa vai trò"
        message={`Bạn có chắc chắn muốn xóa vai trò "${roleToDelete?.name}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
