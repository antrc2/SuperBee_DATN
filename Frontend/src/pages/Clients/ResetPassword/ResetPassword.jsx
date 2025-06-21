// src/pages/ResetPassword.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@utils/http";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receivedToken = queryParams.get("token");
    if (receivedToken) {
      setToken(receivedToken);
    } else {
      setError("Không tìm thấy mã đặt lại mật khẩu.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Mã đặt lại mật khẩu không hợp lệ.");
      return;
    }

    try {
      const response = await api.post("/reset-password", {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message);
      setError("");
      setPassword("");
      setPasswordConfirmation("");
      // Chuyển hướng người dùng về trang đăng nhập sau khi đặt lại thành công
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || "Đã xảy ra lỗi khi đặt lại mật khẩu."
        );
        if (err.response.data.errors) {
          const validationErrors = Object.values(err.response.data.errors)
            .flat()
            .join(" ");
          setError(validationErrors);
        }
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Đặt lại mật khẩu</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!token && (
        <p style={{ color: "red" }}>
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử
          lại từ chức năng "Quên mật khẩu".
        </p>
      )}

      {token && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Xác nhận mật khẩu mới:</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Đặt lại mật khẩu
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
