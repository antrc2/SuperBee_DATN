import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/http";
import { Link } from "react-router-dom";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

const API_URL = "/admin/authorization/permissions";

// --- Form tạo/sửa Permission ---
function PermissionForm({ permission, onSave, onCancel, groups }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (permission) {
      setName(permission.name || "");
      setDescription(permission.description || "");
      setGroupName(permission.group_name || "");
    } else {
      setName("");
      setDescription("");
      setGroupName(groups[0] || ""); // Mặc định chọn group đầu tiên
    }
  }, [permission, groups]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: permission?.id, name, description, group_name: groupName });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {permission ? "Chỉnh sửa quyền" : "Tạo quyền mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="permissionName"
              className="block text-sm font-medium text-gray-700"
            >
              Tên quyền (vd: users.create)
            </label>
            <input
              id="permissionName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="module.action"
              required
            />
          </div>
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700"
            >
              Nhóm quyền
            </label>
            <select
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="permissionDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Mô tả
          </label>
          <input
            id="permissionDescription"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Mô tả ngắn về chức năng của quyền này"
          />
        </div>
        <div className="flex justify-end gap-2">
          {permission && (
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
            {permission ? "Lưu thay đổi" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Modal xác nhận xóa ---
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
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

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPermission, setEditingPermission] = useState(null);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

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

  const handleSavePermission = async (data) => {
    setSuccess("");
    setError("");
    const { id, ...payload } = data;
    const isEditing = !!id;
    const url = isEditing ? `${API_URL}/${id}` : API_URL;

    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("group_name", payload.group_name);
    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (isEditing) {
      formData.append("_method", "PUT");
    }

    try {
      const res = await api.post(url, formData);
      if (res.data.status) {
        setSuccess(res.data.message);
        setEditingPermission(null);
        fetchPermissions();
      } else {
        setError(res.data.message || "Đã có lỗi xảy ra.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Lỗi khi ${isEditing ? "cập nhật" : "tạo"} quyền.`
      );
    } finally {
      clearMessages();
    }
  };

  const confirmDelete = async () => {
    if (!permissionToDelete) return;
    setSuccess("");
    setError("");
    const formData = new FormData();
    formData.append("_method", "DELETE");
    try {
      const res = await api.post(
        `${API_URL}/${permissionToDelete.id}`,
        formData
      );
      if (res.data.status) {
        setSuccess(res.data.message);
        fetchPermissions();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xóa quyền.");
    } finally {
      setPermissionToDelete(null);
      clearMessages();
    }
  };

  if (isLoading) return <LoadingDomain />;

  const permissionGroups = Object.keys(permissions);

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
          Danh sách Quyền Hệ Thống
        </h1>
        {/* Nút quay lại Dashboard */}
        <Link
          to="/admin/authorization"
          className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          &larr; Về Dashboard
        </Link>
      </div>
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

      {/* --- PHẦN TẠO MỚI ĐÃ ĐƯỢC ẨN ĐI ---
      <p className="text-sm text-center text-gray-500 mb-4">Chức năng tạo quyền mới đã bị vô hiệu hóa. Chỉ hiển thị danh sách. </p>
      <PermissionForm
        permission={editingPermission}
        onSave={handleSavePermission}
        onCancel={() => setEditingPermission(null)}
        groups={
          permissionGroups.length > 0 ? permissionGroups : ["Chưa có nhóm"]
        }
      />
      */}

      {/* Nếu có quyền đang được sửa thì hiển thị form */}
      {editingPermission && (
        <PermissionForm
          permission={editingPermission}
          onSave={handleSavePermission}
          onCancel={() => setEditingPermission(null)}
          groups={permissionGroups}
        />
      )}

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
                Guard
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {" "}
            {permissionGroups.length > 0 ? (
              permissionGroups.map((groupName) => (
                <React.Fragment key={groupName}>
                  <tr className="bg-gray-50">
                    <td
                      colSpan="3"
                      className="px-6 py-3 text-sm font-semibold text-gray-800"
                    >
                      {groupName}
                    </td>
                  </tr>
                  {permissions[groupName].map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 font-mono">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {permission.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          api
                        </span>
                      </td>
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
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  Chưa có quyền nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!permissionToDelete}
        onClose={() => setPermissionToDelete(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa quyền"
        message={`Bạn có chắc chắn muốn xóa quyền "${permissionToDelete?.name}"?`}
      />
    </div>
  );
}
