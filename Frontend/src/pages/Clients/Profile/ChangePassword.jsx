"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Save } from "lucide-react";
import api from "@utils/http";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Component con cho input mật khẩu
const PasswordInput = ({
  value,
  onChange,
  name,
  placeholder,
  error,
  show,
  onToggle,
}) => (
  <div>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
        <Lock size={18} />
      </span>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg px-4 py-3 pl-12 pr-12 bg-input text-input border-themed border-hover placeholder-theme"
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && <p className="mt-1.5 text-sm text-red-500">{error[0]}</p>}
  </div>
);

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg">
      {/* Header Section */}
      <div className="pb-6 border-b border-themed">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          Đổi mật khẩu
        </h1>
        <p className="text-secondary mt-1">
          Để đảm bảo an toàn, hãy sử dụng mật khẩu mạnh và không chia sẻ cho bất
          kỳ ai.
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto space-y-6">
        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">
            Mật khẩu hiện tại
          </label>
          <PasswordInput
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu hiện tại"
            error={errors.current_password}
            show={showPasswords.current}
            onToggle={() => togglePasswordVisibility("current")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">
            Mật khẩu mới
          </label>
          <PasswordInput
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Ít nhất 8 ký tự"
            error={errors.new_password}
            show={showPasswords.new}
            onToggle={() => togglePasswordVisibility("new")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">
            Xác nhận mật khẩu mới
          </label>
          <PasswordInput
            name="new_password_confirmation"
            value={formData.new_password_confirmation}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu mới"
            error={errors.new_password_confirmation}
            show={showPasswords.confirm}
            onToggle={() => togglePasswordVisibility("confirm")}
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="action-button action-button-primary"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </div>{" "}
        <p className="text-sm font-normal">
          <Link
            to="/forgot-password"
            className="font-heading font-semibold transition-colors text-secondary hover:text-highlight"
          >
            Quên mật khẩu?
          </Link>
        </p>
      </form>
    </section>
  );
}
