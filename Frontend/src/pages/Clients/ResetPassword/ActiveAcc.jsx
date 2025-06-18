// src/pages/ActiveAcc.js
import React, { useState } from "react";
import api from "@utils/http";

const ActiveAcc = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/sendActiveAccount", { email });
      setMessage(response.data.message);
      setEmail(""); // Clear the email field
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
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
      <h2>Kích Hoạt tài khoản</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email của bạn:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          Gửi yêu cầu đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
};

export default ActiveAcc;
