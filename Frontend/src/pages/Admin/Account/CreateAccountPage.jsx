// src/pages/admin/accounts/CreateAccountPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { pop } = useNotification();

  // States cho form và dữ liệu (KHÔNG THAY ĐỔI)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [assignmentType, setAssignmentType] = useState("role"); // 'role' hoặc 'permissions'
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  // States cho việc tải dữ liệu từ API (KHÔNG THAY ĐỔI)
  const [staffRoles, setStaffRoles] = useState([]);
  const [assignablePermissions, setAssignablePermissions] = useState({});

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch đồng thời cả danh sách roles và permissions (KHÔNG THAY ĐỔI)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          api.get("/admin/accounts/staff-roles"),
          api.get("/admin/accounts/assignable-permissions"),
        ]);

        if (rolesRes.data.status) {
          setStaffRoles(rolesRes.data.data);
          if (rolesRes.data.data.length > 0) {
            setSelectedRole(rolesRes.data.data[0].name);
          }
        }

        if (permsRes.data.status) {
          setAssignablePermissions(permsRes.data.data);
        }
      } catch (err) {
        pop("Không thể tải dữ liệu phân quyền.", "e");
      }
    };
    fetchData();
  }, [pop]);

  // Các hàm xử lý logic (KHÔNG THAY ĐỔI)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePermissionChange = (permissionName) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionName)) newSet.delete(permissionName);
      else newSet.add(permissionName);
      return newSet;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    let payload = {
      ...formData,
      assignment_type: assignmentType,
    };

    if (assignmentType === "role") {
      payload.role_name = selectedRole;
    } else {
      payload.permissions = Array.from(selectedPermissions);
    }

    try {
      await api.post("/admin/accounts/create-staff", payload);
      pop("Tạo tài khoản nhân viên thành công!", "s");
      navigate("/admin/users");
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
        pop("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.", "e");
      } else {
        pop(err.response?.data?.message || "Đã có lỗi xảy ra.", "e");
      }
    } finally {
      setLoading(false);
    }
  };

  // Base class cho các input để nhất quán
  const inputClass =
    "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

  const labelClass =
    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    // Giao diện đã được refactor
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 mb-4 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Tạo tài khoản nhân viên mới
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Điền thông tin và phân quyền cho tài khoản nhân viên dưới đây.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Card Thông tin tài khoản */}
          <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
              Thông tin đăng nhập
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label htmlFor="username" className={labelClass}>
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.username[0]}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2">{errors.email[0]}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="password" className={labelClass}>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.password[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card Phân quyền */}
          <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
              Phân quyền
            </h2>

            {/* Lựa chọn cách gán quyền được thiết kế lại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div
                onClick={() => setAssignmentType("role")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  assignmentType === "role"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-600"
                }`}
              >
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  Gán theo vai trò
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Chọn một vai trò có sẵn với bộ quyền đã được định nghĩa trước.
                </p>
              </div>
              <div
                onClick={() => setAssignmentType("permissions")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  assignmentType === "permissions"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-600"
                }`}
              >
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  Gán quyền trực tiếp
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tự chọn các quyền hạn cụ thể cho tài khoản này.
                </p>
              </div>
            </div>
            {errors.assignment_type && (
              <p className="text-red-500 text-xs my-2">
                {errors.assignment_type[0]}
              </p>
            )}

            {/* Giao diện động */}
            {assignmentType === "role" ? (
              <div>
                <label htmlFor="role_name" className={labelClass}>
                  Chọn vai trò
                </label>
                <select
                  id="role_name"
                  name="role_name"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={inputClass}
                >
                  {staffRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.description || role.name}
                    </option>
                  ))}
                </select>
                {errors.role_name && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.role_name[0]}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                  Nhân viên sẽ được gán vai trò mặc định là{" "}
                  <span className="font-mono bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                    staff-nhan-vien
                  </span>{" "}
                  và các quyền bạn chọn dưới đây.
                </p>
                {errors.permissions && (
                  <p className="text-red-500 text-xs">
                    {errors.permissions[0]}
                  </p>
                )}

                {Object.entries(assignablePermissions).map(
                  ([groupName, permissions]) => (
                    <div key={groupName}>
                      <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">
                        {groupName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {permissions.map((p) => (
                          <label
                            key={p.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border ${
                              selectedPermissions.has(p.name)
                                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700"
                                : "bg-slate-100 dark:bg-slate-700/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 rounded text-indigo-600 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-indigo-500"
                              checked={selectedPermissions.has(p.name)}
                              onChange={() => handlePermissionChange(p.name)}
                            />
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {p.description}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900 transition-all"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateAccountPage;
