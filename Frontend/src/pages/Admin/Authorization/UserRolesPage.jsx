import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/http";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

// Trang danh sách người dùng
export function UserListPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Thay đổi để lấy hết user, không phân trang để đơn giản
        const response = await api.get(
          "/admin/authorization/users?per_page=100"
        );
        setUsers(response.data.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading)
    return (
      <div className="text-center p-8 animate-pulse">
        Đang tải danh sách người dùng...
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Quản lý Vai trò Người dùng
      </h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">
                        Chưa có vai trò
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() =>
                      navigate(`/admin/authorization/users/${user.id}/assign`)
                    }
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Quản lý vai trò
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Trang gán vai trò cho 1 người dùng cụ thể
export function UserAssignRolesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get(
          `/admin/authorization/users/${userId}/roles`
        );
        setUserData(response.data.user);
        setAllRoles(response.data.all_roles);
        setAssignedRoles(response.data.assigned_roles);
      } catch (err) {
        setError(
          "Không thể tải dữ liệu người dùng. Người dùng có thể không tồn tại."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleCheckboxChange = (roleName) => {
    setAssignedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post(`/admin/authorization/users/${userId}/roles`, {
        roles: assignedRoles,
      });
      alert("Cập nhật vai trò thành công!");
      navigate("/admin/authorization/users");
    } catch (err) {
      setError("Lỗi khi cập nhật vai trò.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingDomain />;

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        &larr; Quay lại danh sách
      </button>
      {error ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Gán vai trò cho người dùng
          </h1>
          {userData && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-md border border-indigo-200">
              <p className="text-lg font-semibold text-gray-800">
                {userData.username}
              </p>
              <p className="text-sm text-gray-600">{userData.email}</p>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Chọn vai trò:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {allRoles.map((roleName) => (
              <div key={roleName} className="flex items-center">
                <input
                  id={`role-${roleName}`}
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={assignedRoles.includes(roleName)}
                  onChange={() => handleCheckboxChange(roleName)}
                />
                <label
                  htmlFor={`role-${roleName}`}
                  className="ml-2 block text-sm text-gray-900 capitalize"
                >
                  {roleName}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
