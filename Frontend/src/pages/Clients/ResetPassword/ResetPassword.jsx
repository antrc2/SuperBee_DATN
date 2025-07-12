import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@utils/http";
import AuthCardLayout from "@layouts/AuthCardLayout";
import { KeyRound, Eye, EyeOff } from "lucide-react";

// Component con cho Input Mật khẩu để tái sử dụng và làm code sạch hơn
const PasswordField = ({ label, value, onChange, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          className={`w-full rounded-lg px-4 py-3 bg-input text-input border-themed pr-12 ${
            error ? "border-red-500" : "border-hover"
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error[0]}</p>}
    </div>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // Dành cho lỗi chung
  const [validationErrors, setValidationErrors] = useState({}); // Dành cho lỗi của từng trường
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receivedToken = queryParams.get("token");
    if (receivedToken) {
      setToken(receivedToken);
    } else {
      setError("Không tìm thấy mã đặt lại mật khẩu trong liên kết.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset tất cả các state lỗi và thông báo trước khi gửi
    setMessage("");
    setError("");
    setValidationErrors({});
    setLoading(true);

    if (!token) {
      setError("Mã đặt lại mật khẩu không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/reset-password", {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message);
      // Xóa các trường sau khi thành công
      setPassword("");
      setPasswordConfirmation("");

      // Chuyển hướng sau 3 giây
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (err) {
      if (err.response) {
        // --- ĐÂY LÀ PHẦN THAY ĐỔI QUAN TRỌNG ---
        // Nếu là lỗi validation (422) và có object 'errors'
        if (err.response.status === 422 && err.response.data.errors) {
          setValidationErrors(err.response.data.errors);
        } else {
          // Nếu là các lỗi khác (400, 500...)
          setError(
            err.response.data.message || "Đã xảy ra lỗi khi đặt lại mật khẩu."
          );
        }
      } else {
        // Lỗi mạng hoặc không kết nối được server
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout title="Đặt lại mật khẩu" icon={KeyRound}>
      {message && <div className="alert alert-success mb-4">{message}</div>}
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {token ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ít nhất 8 ký tự"
            error={validationErrors.password}
          />
          <PasswordField
            label="Xác nhận mật khẩu"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            // Lỗi 'confirmed' được gắn vào trường 'password', nên ta cũng có thể hiển thị nó ở đây nếu muốn
            // Nhưng để đơn giản, chỉ cần hiển thị dưới ô đầu tiên là đủ
            error={validationErrors.password_confirmation}
          />
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="action-button action-button-primary"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </div>
        </form>
      ) : (
        // Hiển thị lỗi chung nếu không có token
        !message &&
        !error && (
          <p className="text-secondary text-center">
            Đang kiểm tra liên kết...
          </p>
        )
      )}
    </AuthCardLayout>
  );
};

export default ResetPassword;
