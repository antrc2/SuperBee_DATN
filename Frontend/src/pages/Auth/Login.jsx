import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/http";
import { showError, showAlert } from "../../utils/notification";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [webId, setWebId] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/accounts/login", {
        username,
        password,
      });
      if (res.data?.access_token) {
        localStorage.setItem("accessToken", res.data.access_token);
        localStorage.setItem("refreshToken", res.data.refresh_token);
        showAlert("Đăng nhập thành công!", "Thành công", "success");
        navigate("/auth/login");
      } else {
        showError(res.data?.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tên đăng nhập</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <div className="mt-4 text-center">
          <span>Bạn chưa có tài khoản? Đăng ký ngay </span>
          <a
            href="/auth/register"
            className="text-blue-500 hover:underline"
          >
            Đăng ký
          </a>
        </div>
      </form>
    </div>
  );
}