import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/http";
import { showAlert, showError } from "../../utils/notification";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    avatar_url: "",
    web_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/accounts/register", form);
      if (res.data?.status !== false) {
        showAlert("Đăng ký thành công!", "Thành công", "success");
        navigate("/auth/login");
      } else {
        showError(res.data?.message || "Đăng ký thất bại");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            className="w-full border rounded px-3 py-2"
            value={form.username}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            type="password"
            name="password"
            className="w-full border rounded px-3 py-2"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Họ và tên</label>
          <input
            type="text"
            name="fullname"
            className="w-full border rounded px-3 py-2"
            value={form.fullname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border rounded px-3 py-2"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            className="w-full border rounded px-3 py-2"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Avatar URL</label>
          <input
            type="text"
            name="avatar_url"
            className="w-full border rounded px-3 py-2"
            value={form.avatar_url}
            onChange={handleChange}
          />
        </div>
      
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        <div className="mt-4 text-center">
          <span>Đã có tài khoản? </span>
          <a
            href="/login"
            className="text-blue-500 hover:underline"
          >
            Đăng nhập
          </a>
        </div>
      </form>
    </div>
  );
}