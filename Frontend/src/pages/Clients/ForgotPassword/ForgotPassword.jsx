import React, { useState } from "react";
import api from "@utils/http";
import AuthCardLayout from "@layouts/AuthCardLayout"; // Import layout mới
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/forgot-password", { email });
      setMessage(response.data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout title="Quên mật khẩu" icon={Mail}>
      <p className="text-secondary text-sm text-center mb-6 -mt-4">
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
      </p>

      {message && <div className="alert alert-success mb-4">{message}</div>}
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-secondary mb-2"
          >
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg px-4 py-3 bg-input text-input border-themed border-hover placeholder-theme"
            placeholder="example@email.com"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="action-button action-button-primary"
        >
          {loading ? "Đang gửi..." : "Gửi liên kết"}
        </button>
      </form>
    </AuthCardLayout>
  );
};

export default ForgotPassword;
