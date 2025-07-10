"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "@utils/http";
import { toast } from "react-toastify";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--text-primary)",
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/user/change-password", formData);

      if (response.status === 200) {
        toast.success(response.data.message || "Đổi mật khẩu thành công!");
        setFormData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response) {
        const backendErrors = error.response.data.errors;
        const generalMessage =
          error.response.data.message || "Đã có lỗi xảy ra.";

        toast.error(generalMessage);

        if (backendErrors) {
          setErrors(backendErrors);
          for (const key in backendErrors) {
            if (Array.isArray(backendErrors[key])) {
              backendErrors[key].forEach((msg) => toast.error(msg));
            } else {
              toast.error(backendErrors[key]);
            }
          }
        }
      } else {
        toast.error("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: "var(--bg-content-900)" }}
    >
      {/* Header */}
      <div
        className="pb-6 border-b"
        style={{ borderColor: "var(--bg-content-800)" }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Đổi mật khẩu
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Cập nhật mật khẩu để tăng cường bảo mật cho tài khoản.
        </p>
      </div>

      <form
        onSubmit={() => {
          /* Handle submit */
        }}
        className="space-y-6 pt-6"
      >
        {/* Current Password */}
        <div>
          <label
            className="text-sm font-medium text-slate-300 mb-2 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={"password"}
              name="current_password"
              placeholder="Nhập mật khẩu hiện tại"
              className={`w-full rounded-lg px-4 py-3 pr-12`}
              style={inputStyle}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.current_password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.current_password[0]}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            className="text-sm font-medium text-slate-300 mb-2 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={"password"}
              name="new_password"
              placeholder="Nhập mật khẩu mới"
              className={`w-full rounded-lg px-4 py-3 pr-12`}
              style={inputStyle}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.new_password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.new_password[0]}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            className="text-sm font-medium text-slate-300 mb-2 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={"password"}
              name="new_password_confirmation"
              placeholder="Xác nhận mật khẩu mới"
              className={`w-full rounded-lg px-4 py-3 pr-12`}
              style={inputStyle}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.new_password_confirmation && (
            <p className="mt-1 text-sm text-red-400">
              {errors.new_password_confirmation[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--accent-primary)",
            color: "var(--button-text)",
          }}
        >
          {loading ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
}
