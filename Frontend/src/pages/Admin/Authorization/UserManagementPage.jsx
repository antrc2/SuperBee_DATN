import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../utils/http";

// --- Component con ---
const PermissionGroup = ({
  groupName,
  permissions,
  selected,
  onCheckboxChange,
  onSelectAll,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const allInGroup = permissions.map((p) => p.name);
  const isAllSelected = allInGroup.every((p) => selected.includes(p));
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md mb-2">
      <div
        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 rounded mr-3"
            checked={isAllSelected}
            onChange={(e) => onSelectAll(allInGroup, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">
            {groupName}
          </h3>
        </div>
        <span
          className={`transform transition-transform text-gray-500 dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>
      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {permissions.map((p) => (
            <div key={p.id} className="flex items-center">
              <input
                id={`perm-${p.id}`}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
                checked={selected.includes(p.name)}
                onChange={() => onCheckboxChange(p.name)}
              />
              <label
                htmlFor={`perm-${p.id}`}
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                <span className="font-mono">
                  {p.name.split(".")[1] || p.name}
                </span>
                <p className="text-xs text-gray-500">{p.description}</p>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Component chính ---
export default function UserManagementPage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [allSystemRoles, setAllSystemRoles] = useState([]);
  const [allSystemPermissions, setAllSystemPermissions] = useState({});
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [directPermissions, setDirectPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/admin/authorization/users/${userId}/manage`
      );
      if (response.data.status) {
        const data = response.data.data;
        setUserData(data.user);
        setAllSystemRoles(data.all_system_roles);
        setAllSystemPermissions(data.all_system_permissions);
        setAssignedRoles(data.assigned_roles);
        setDirectPermissions(data.direct_permissions);
        setAllUserPermissions(data.all_user_permissions);
      } else {
        setError(response.data.message || "Lỗi tải dữ liệu.");
      }
    } catch (err) {
      setError("Không thể tải dữ liệu người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveChanges = async (type) => {
    setSuccess("");
    setError("");
    let url = "";
    let payload = {};

    if (type === "roles") {
      url = `/admin/authorization/users/${userId}/manage/roles`;
      payload = { roles: assignedRoles };
    } else if (type === "permissions") {
      url = `/admin/authorization/users/${userId}/manage/permissions`;
      payload = { permissions: directPermissions };
    } else {
      return;
    }

    try {
      const res = await api.post(url, payload);
      if (res.data.status) {
        setSuccess(res.data.message);
        fetchData(); // Tải lại tất cả dữ liệu để đồng bộ
      } else {
        setError(res.data.message || "Đã có lỗi xảy ra.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi khi lưu thay đổi."
      );
    } finally {
      clearMessages();
    }
  };

  if (loading)
    return (
      <div className="text-center p-8 animate-pulse dark:text-gray-400">
        Đang tải...
      </div>
    );

  if (error && !userData)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200">
      <div className="mb-6">
        <Link
          to="/admin/authorization"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          &larr; Quay lại Dashboard
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex items-center">
        <img
          src={
            userData.avatar_url ||
            `https://i.pravatar.cc/150?u=${userData.email}`
          }
          alt={userData.username}
          className="h-20 w-20 rounded-full object-cover mr-6"
        />
        <div>
          <h1 className="text-3xl font-bold">{userData.username}</h1>
          <p className="text-gray-500 dark:text-gray-400">{userData.email}</p>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("summary")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "summary"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tổng hợp Quyền
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "roles"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Quản lý Vai trò
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "permissions"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Quản lý Quyền trực tiếp
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "summary" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">
              Tất cả quyền người dùng đang có
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Bao gồm quyền từ vai trò và quyền trực tiếp. Đây là quyền hạn cuối
              cùng của người dùng.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {allUserPermissions.sort().map((p) => (
                <span
                  key={p}
                  className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        {activeTab === "roles" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Quản lý Vai trò</h2>
              <button
                onClick={() => handleSaveChanges("roles")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Lưu Vai trò
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allSystemRoles.map((role) => (
                <div key={role.id} className="flex items-center">
                  <input
                    id={`role-${role.id}`}
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 rounded"
                    checked={assignedRoles.includes(role.name)}
                    onChange={() =>
                      setAssignedRoles((prev) =>
                        prev.includes(role.name)
                          ? prev.filter((r) => r !== role.name)
                          : [...prev, role.name]
                      )
                    }
                  />
                  <label
                    htmlFor={`role-${role.id}`}
                    className="ml-2 block text-sm"
                  >
                    <span className="capitalize font-medium">{role.name}</span>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "permissions" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Quản lý Quyền trực tiếp
              </h2>
              <button
                onClick={() => handleSaveChanges("permissions")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Lưu Quyền
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Các quyền này được gán thêm, ngoài các quyền đã có từ vai trò.
            </p>
            {Object.entries(allSystemPermissions).map(
              ([groupName, permissions]) => (
                <PermissionGroup
                  key={groupName}
                  groupName={groupName}
                  permissions={permissions}
                  selected={directPermissions}
                  onCheckboxChange={(p) =>
                    setDirectPermissions((prev) =>
                      prev.includes(p)
                        ? prev.filter((i) => i !== p)
                        : [...prev, p]
                    )
                  }
                  onSelectAll={(groupPerms, isSelected) =>
                    setDirectPermissions((prev) => {
                      const other = prev.filter((p) => !groupPerms.includes(p));
                      return isSelected ? [...other, ...groupPerms] : other;
                    })
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
