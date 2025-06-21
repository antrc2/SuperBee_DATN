"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
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
    <div className="max-w-md mx-auto ">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Đổi mật khẩu</h1>
              <p className="text-slate-400 text-sm">
                Cập nhật mật khẩu bảo mật
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Lock className="h-4 w-4" />
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className={`w-full bg-slate-700 border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 transition-colors ${
                    errors.current_password
                      ? "border-red-500"
                      : "border-slate-600 focus:border-blue-500"
                  }`}
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Lock className="h-4 w-4" />
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                  className={`w-full bg-slate-700 border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 transition-colors ${
                    errors.new_password
                      ? "border-red-500"
                      : "border-slate-600 focus:border-blue-500"
                  }`}
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Lock className="h-4 w-4" />
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu mới"
                  className={`w-full bg-slate-700 border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 transition-colors ${
                    errors.new_password_confirmation
                      ? "border-red-500"
                      : "border-slate-600 focus:border-blue-500"
                  }`}
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Cập nhật mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
