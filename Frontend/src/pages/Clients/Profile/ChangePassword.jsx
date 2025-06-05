import React, { useState } from "react";
import api from "@utils/http"; // Import Axios instance
import { toast } from "react-toastify"; // For notifications

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // <-- State mới để lưu lỗi validation từng trường

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    // Xóa lỗi cho trường hiện tại khi người dùng bắt đầu gõ
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Xóa tất cả lỗi cũ trước khi gửi request mới

    try {
      const response = await api.post("/user/change-password", formData);

      if (response.status === 200) {
        toast.success(response.data.message || "Đổi mật khẩu thành công!");
        setFormData({
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response) {
        const backendErrors = error.response.data.errors;
        const generalMessage =
          error.response.data.message || "Đã có lỗi xảy ra.";

        // Hiển thị toast cho thông báo chung
        toast.error(generalMessage);

        if (backendErrors) {
          // Lưu lỗi vào state 'errors' để hiển thị dưới mỗi input
          setErrors(backendErrors);

          // Hiển thị toast cho từng lỗi cụ thể nếu có
          for (const key in backendErrors) {
            if (Array.isArray(backendErrors[key])) {
              backendErrors[key].forEach((msg) => toast.error(msg));
            } else {
              toast.error(backendErrors[key]); // Trường hợp lỗi không phải mảng (ít xảy ra với Laravel Validation)
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Đổi mật khẩu
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="current_password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              className={`mt-1 block w-full border ${
                errors.current_password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.current_password && ( // <-- Hiển thị lỗi dưới input
              <p className="mt-1 text-sm text-red-600">
                {errors.current_password[0]}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              className={`mt-1 block w-full border ${
                errors.new_password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.new_password && ( // <-- Hiển thị lỗi dưới input
              <p className="mt-1 text-sm text-red-600">
                {errors.new_password[0]}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="new_password_confirmation"
              className="block text-sm font-medium text-gray-700"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="new_password_confirmation"
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu mới"
              className={`mt-1 block w-full border ${
                errors.new_password_confirmation
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.new_password_confirmation && ( // <-- Hiển thị lỗi dưới input
              <p className="mt-1 text-sm text-red-600">
                {errors.new_password_confirmation[0]}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
