// src/pages/admin/accounts/CreateAccountPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { pop } = useNotification();

  // States cho form và dữ liệu
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [assignmentType, setAssignmentType] = useState("role"); // 'role' hoặc 'permissions'
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  // States cho việc tải dữ liệu từ API
  const [staffRoles, setStaffRoles] = useState([]);
  const [assignablePermissions, setAssignablePermissions] = useState({});

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch đồng thời cả danh sách roles và permissions
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
            setSelectedRole(rolesRes.data.data[0].name); // Set role mặc định
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
        pop("Dữ liệu không hợp lệ, vui lòng kiểm tra.", "e");
      } else {
        pop(err.response?.data?.message || "Đã có lỗi xảy ra.", "e");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4 hover:text-indigo-500"
        >
          &larr; Quay lại
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Tạo tài khoản nhân viên mới
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Phần thông tin tài khoản */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Thông tin đăng nhập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* username, email, password inputs... */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="username"
              >
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="form-input w-full dark:bg-slate-700"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input w-full dark:bg-slate-700"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-input w-full dark:bg-slate-700"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Phần phân quyền */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Phương thức phân quyền
          </h2>
          {errors.assignment_type && (
            <p className="text-red-500 text-xs mt-1">
              {errors.assignment_type[0]}
            </p>
          )}
          {/* Lựa chọn cách gán quyền */}
          <div className="flex space-x-4 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="assignmentType"
                value="role"
                checked={assignmentType === "role"}
                onChange={(e) => setAssignmentType(e.target.value)}
                className="form-radio"
              />
              <span>Gán theo vai trò có sẵn</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="assignmentType"
                value="permissions"
                checked={assignmentType === "permissions"}
                onChange={(e) => setAssignmentType(e.target.value)}
                className="form-radio"
              />
              <span>Gán quyền trực tiếp</span>
            </label>
          </div>

          {/* Giao diện động */}
          {assignmentType === "role" ? (
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="role_name"
              >
                Chọn vai trò
              </label>
              <select
                id="role_name"
                name="role_name"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="form-select w-full dark:bg-slate-700"
              >
                {staffRoles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.description || role.name}
                  </option>
                ))}
              </select>
              {errors.role_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role_name[0]}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-slate-500">
                Nhân viên sẽ được gán vai trò{" "}
                <span className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded">
                  staff-nhan-vien
                </span>{" "}
                và các quyền bạn chọn dưới đây.
              </p>
              {errors.permissions && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.permissions[0]}
                </p>
              )}
              {Object.entries(assignablePermissions).map(
                ([groupName, permissions]) => (
                  <div key={groupName}>
                    <h3 className="text-md font-semibold mb-3">{groupName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {permissions.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md"
                        >
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={selectedPermissions.has(p.name)}
                            onChange={() => handlePermissionChange(p.name)}
                          />
                          <span className="text-sm">{p.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountPage;
