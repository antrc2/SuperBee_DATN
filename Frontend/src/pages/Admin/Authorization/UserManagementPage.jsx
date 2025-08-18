import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../utils/http";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

// Component nút Tab
const TabButton = ({ activeTab, tabName, children, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all
        ${
          activeTab === tabName
            ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
        }`}
  >
    {children}
  </button>
);

// Component nhóm quyền
const PermissionGroup = ({
  groupName,
  permissions,
  selected,
  onCheckboxChange,
  onSelectAll,
  initialPermissions, // [MỚI] Nhận vào các quyền ban đầu
  permissionMode, // [MỚI] Nhận vào chế độ đang chọn
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
          {permissions.map((p) => {
            const isInitial = initialPermissions.includes(p.name);
            const isDisabled = permissionMode === "add" && isInitial;

            return (
              <div key={p.id} className="flex items-center">
                <input
                  id={`perm-${p.id}`}
                  type="checkbox"
                  className={`h-4 w-4 text-indigo-600 rounded ${
                    isDisabled
                      ? "bg-gray-200 border-gray-300 cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  checked={selected.includes(p.name)}
                  onChange={() => onCheckboxChange(p.name)}
                  disabled={isDisabled}
                />
                <label
                  htmlFor={`perm-${p.id}`}
                  className={`ml-2 block text-sm ${
                    isDisabled
                      ? "text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-75"
                      : "text-gray-900 dark:text-gray-300"
                  }`}
                >
                  <span className="font-medium">
                    {p.description}
                    {isDisabled && (
                      <span className="text-xs ml-1 text-blue-600 dark:text-blue-400">
                        (Đã có)
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-gray-500 font-mono">{p.name}</p>
                </label>
              </div>
            );
          })}
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
  const [allSystemPermissions, setAllSystemPermissions] = useState({});
  const [directPermissions, setDirectPermissions] = useState([]);
  const [initialDirectPermissions, setInitialDirectPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("permissions");
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [permissionMode, setPermissionMode] = useState("sync");

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
        setAllSystemPermissions(data.all_system_permissions);
        setDirectPermissions(data.direct_permissions);
        setInitialDirectPermissions(data.direct_permissions);
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

  // [SỬA LỖI] Thêm useEffect để xử lý khi permissionMode thay đổi
  useEffect(() => {
    if (permissionMode === "add") {
      // Khi chuyển sang chế độ 'Bổ sung', đảm bảo tất cả các quyền ban đầu đều được chọn
      // Bằng cách hợp nhất (union) mảng quyền hiện tại với mảng quyền ban đầu
      setDirectPermissions((prev) => {
        const newPermissions = [
          ...new Set([...prev, ...initialDirectPermissions]),
        ];
        return newPermissions;
      });
    } else if (permissionMode === "sync") {
      // Khi chuyển về 'Gán lại', reset về trạng thái ban đầu
      setDirectPermissions([...initialDirectPermissions]);
    }
  }, [permissionMode, initialDirectPermissions]);

  const handleSaveChanges = async () => {
    setSuccess("");
    setError("");

    const url = `/admin/authorization/users/${userId}/manage/permissions`;
    const payload = {
      permissions: directPermissions,
      mode: permissionMode,
    };

    try {
      const res = await api.post(url, payload);
      if (res.data.status) {
        setSuccess(res.data.message);
        fetchData();
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

  // [MỚI] Hàm xử lý thay đổi checkbox với logic đặc biệt cho chế độ "add"
  const handleCheckboxChange = (permissionName) => {
    // Nếu đang ở chế độ "add" và quyền này là quyền ban đầu, không cho phép bỏ chọn
    if (
      permissionMode === "add" &&
      initialDirectPermissions.includes(permissionName)
    ) {
      return;
    }

    setDirectPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  // [MỚI] Hàm xử lý chọn tất cả với logic đặc biệt cho chế độ "add"
  const handleSelectAll = (groupPerms, isSelected) => {
    setDirectPermissions((prev) => {
      const otherPerms = prev.filter((p) => !groupPerms.includes(p));

      if (isSelected) {
        // Chọn tất cả quyền trong nhóm
        return [...otherPerms, ...groupPerms];
      } else {
        // Bỏ chọn tất cả, nhưng nếu đang ở chế độ "add" thì giữ lại các quyền ban đầu
        if (permissionMode === "add") {
          const initialInGroup = initialDirectPermissions.filter((p) =>
            groupPerms.includes(p)
          );
          return [...otherPerms, ...initialInGroup];
        }
        return otherPerms;
      }
    });
  };

  if (loading) return <LoadingDomain />;
  if (error && !userData)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200">
      <div className="flex justify-start mb-6">
        <Link
          to="/admin/authorization"
          className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          &larr; Về Dashboard
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
          role="alert"
        >
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <img
          src={
            userData.avatar_url ||
            `https://i.pravatar.cc/150?u=${userData.email}`
          }
          alt={userData.username}
          className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-300 dark:ring-indigo-500"
        />
        <div>
          <h1 className="text-3xl font-bold text-center md:text-left">
            {userData.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center md:text-left">
            {userData.email}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 px-6" aria-label="Tabs">
            <TabButton
              activeTab={activeTab}
              tabName="permissions"
              onClick={() => setActiveTab("permissions")}
            >
              Quản lý Quyền trực tiếp
            </TabButton>
            <TabButton
              activeTab={activeTab}
              tabName="summary"
              onClick={() => setActiveTab("summary")}
            >
              Tổng hợp Quyền
            </TabButton>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "summary" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Tất cả quyền người dùng đang có
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Bao gồm quyền từ vai trò và quyền trực tiếp. Đây là quyền hạn
                cuối cùng của người dùng.
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

          {activeTab === "permissions" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold">
                  Quản lý Quyền trực tiếp
                </h2>
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Chế độ lưu:
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="mode_sync"
                      name="permission_mode"
                      value="sync"
                      checked={permissionMode === "sync"}
                      onChange={() => setPermissionMode("sync")}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50"
                      disabled={loading}
                    />
                    <label htmlFor="mode_sync" className="ml-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Gán lại từ đầu
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Xóa hết quyền cũ, chỉ áp dụng các quyền được chọn.
                      </p>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="mode_add"
                      name="permission_mode"
                      value="add"
                      checked={permissionMode === "add"}
                      onChange={() => setPermissionMode("add")}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50"
                      disabled={loading}
                    />
                    <label htmlFor="mode_add" className="ml-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Bổ sung quyền
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Giữ các quyền hiện có, chỉ thêm các quyền mới được chọn.
                      </p>
                    </label>
                  </div>
                </div>
                {permissionMode === "add" && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Chế độ Bổ sung:</strong> Các quyền đã có sẽ được
                      đánh dấu và không thể bỏ chọn. Bạn chỉ có thể chọn thêm
                      các quyền mới.
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Các quyền này được gán thêm, ngoài các quyền đã có từ vai trò.
                Các checkbox được tích sẵn là các quyền người dùng đang có.
              </p>
              {Object.entries(allSystemPermissions).map(
                ([groupName, permissions]) => (
                  <PermissionGroup
                    key={groupName}
                    groupName={groupName}
                    permissions={permissions}
                    selected={directPermissions}
                    initialPermissions={initialDirectPermissions}
                    permissionMode={permissionMode}
                    onCheckboxChange={handleCheckboxChange}
                    onSelectAll={handleSelectAll}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
