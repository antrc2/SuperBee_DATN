import React, { useState } from "react";
import api from "@utils/http";
import AuthCardLayout from "@layouts/AuthCardLayout";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActiveAcc = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate(); // For redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSending(true); // Start sending animation

    try {
      const response = await api.post("/sendActiveAccount", { email });
      // Simulate network delay for animation visibility (remove in production if not needed)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage(
        response.data.message ||
          "Yêu cầu kích hoạt đã được gửi thành công! Vui lòng kiểm tra email của bạn."
      );
      setEmail(""); // Clear the email field

      // After 3 seconds, show success message and redirect
      setTimeout(() => {
        setMessage("Vui lòng kiểm tra email của bạn để kích hoạt tài khoản!"); // Final message before redirect
        setTimeout(() => {
          navigate("/"); // Redirect to home page
        }, 1500); // Give a moment to read the final message
      }, 3000); // 3 seconds before the final message and redirect countdown begins
    } catch (err) {
      setIsSending(false); // Stop sending animation on error
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <AuthCardLayout title="Kích hoạt tài khoản" icon={Send}>
      <p className="text-secondary text-sm text-center mb-6 -mt-4">
        Chưa nhận được email? Nhập lại email của bạn để chúng tôi gửi lại liên
        kết kích hoạt.
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
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg px-4 py-3 bg-input text-input border-themed border-hover placeholder-theme"
            placeholder="example@email.com"
          />
        </div>
        <button
          type="submit"
          disabled={isSending}
          className="action-button action-button-primary"
        >
          {isSending ? "Đang gửi..." : "Gửi lại email kích hoạt"}
        </button>
      </form>
    </AuthCardLayout>
  );
};

export default ActiveAcc;
