// File: src/pages/admin/employees/components/EmployeeForm.jsx
import React, { useState, useEffect } from "react";
import { getFormData } from "@services/employeeService";
import { useNavigate } from "react-router-dom";

export const EmployeeForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isLoading,
  serverErrors,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    start_date: new Date().toISOString().split("T")[0],
    status: "active",
    role_id: "",
    type: "",
  });

  const [roles, setRoles] = useState([]);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await getFormData();
        setRoles(response.data.roles);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu form:", error);
      }
    };
    fetchOptions();
  }, []);

  // SỬA LẠI: useEffect để điền dữ liệu cho form edit
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        username: initialData.user?.username || "",
        email: initialData.user?.email || "",
        password: "", // Luôn để trống mật khẩu khi sửa
        start_date: initialData.start_date?.split("T")[0] || "", // Định dạng lại ngày
        status: initialData.status || "active",
        role_id: initialData.user?.roles?.[0]?.id || "",
        // Lấy 'type' từ object lồng nhau một cách an toàn
        type: initialData.agent_assignment?.agent?.type || "",
      });
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setClientErrors({});
    }
  }, [serverErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (clientErrors[name]) {
      setClientErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "role_id") {
      // Khi đổi vai trò, reset lại loại hỗ trợ nếu không phải NV Hỗ trợ
      if (value != 7) {
        setFormData((prev) => ({ ...prev, type: "" }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim())
      errors.username = "Tên đăng nhập là bắt buộc.";
    if (!formData.email.trim()) {
      errors.email = "Email là bắt buộc.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Định dạng email không hợp lệ.";
    }

    if (!isEditMode || (isEditMode && formData.password)) {
      if (!formData.password && !isEditMode) {
        errors.password = "Mật khẩu là bắt buộc khi tạo mới.";
      } else if (formData.password && formData.password.length < 8) {
        errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
      }
    }

    if (!formData.start_date) errors.start_date = "Ngày vào làm là bắt buộc.";
    if (!formData.role_id) errors.role_id = "Vui lòng chọn vai trò.";
    if (formData.role_id == 7 && !formData.type)
      errors.type = "Vui lòng chọn loại nhân viên hỗ trợ.";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    const dataToSubmit = { ...formData };
    if (isEditMode && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    if (dataToSubmit.role_id != 7) {
      delete dataToSubmit.type;
    }
    onSubmit(dataToSubmit);
  };

  const roleDescription =
    roles.find((r) => r.id == formData.role_id)?.description || "Nhân viên";
  const getFieldError = (fieldName) =>
    clientErrors[fieldName] || serverErrors?.[fieldName]?.[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Thông tin nhân viên
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEditMode
              ? "Cập nhật thông tin nhân viên hiện tại"
              : `Tạo mới ${roleDescription}`}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError("username") ? "border-red-500" : ""
                }`}
                placeholder="Nhập tên đăng nhập"
              />
              {getFieldError("username") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("username")}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError("email") ? "border-red-500" : ""
                }`}
                placeholder="example@domain.com"
              />
              {getFieldError("email") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("email")}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mật khẩu{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && (
                  <span className="text-gray-500 text-xs ml-2">
                    (Để trống nếu không đổi)
                  </span>
                )}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError("password") ? "border-red-500" : ""
                }`}
                placeholder={
                  isEditMode ? "Nhập mật khẩu mới" : "Tối thiểu 8 ký tự"
                }
              />
              {getFieldError("password") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("password")}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="role_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError("role_id") ? "border-red-500" : ""
                }`}
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.description || role.name}
                  </option>
                ))}
              </select>
              {getFieldError("role_id") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("role_id")}
                </p>
              )}
            </div>

            {formData.role_id == 7 && (
              <div className="sm:col-span-3">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Loại nhân viên hỗ trợ <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required={formData.role_id == 7}
                  className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    getFieldError("type") ? "border-red-500" : ""
                  }`}
                >
                  <option value="">-- Chọn loại hỗ trợ --</option>
                  <option value="support">Hỗ trợ</option>
                  <option value="complaint">Khiếu nại</option>
                </select>
                {getFieldError("type") && (
                  <p className="mt-1 text-sm text-red-500">
                    {getFieldError("type")}
                  </p>
                )}
              </div>
            )}

            <div className="sm:col-span-3">
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Ngày vào làm <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError("start_date") ? "border-red-500" : ""
                }`}
              />
              {getFieldError("start_date") && (
                <p className="mt-1 text-sm text-red-500">
                  {getFieldError("start_date")}
                </p>
              )}
            </div>

            {isEditMode && (
              <div className="sm:col-span-3">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    getFieldError("status") ? "border-red-500" : ""
                  }`}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="on_leave">Đang nghỉ phép</option>
                  <option value="terminated">Đã vô hiệu hóa</option>
                </select>
                {getFieldError("status") && (
                  <p className="mt-1 text-sm text-red-500">
                    {getFieldError("status")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            disabled={isLoading}
            className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading
              ? "Đang lưu..."
              : isEditMode
              ? "Cập nhật"
              : `Tạo ${roleDescription}`}
          </button>
        </div>
      </div>
    </form>
  );
};
