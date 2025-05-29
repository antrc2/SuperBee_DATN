import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../../utils/http";
import { showAlert, showError } from "../../utils/notification";

export default function AuthLayout() {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.get("/logout"); // Gọi API logout backend
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      showAlert("Đăng xuất thành công!", "Thông báo", "success");
      navigate("/");
    } catch (err) {
      showError("Đăng xuất thất bại!");
    }
  };

  return (
    <div>
<<<<<<< HEAD
      <header>Header Login</header>
      <div className="mt-4 text-center">
        <a
          href="#"
          className="text-blue-500 hover:underline"
          onClick={handleLogout}
        >
          Đăng xuất
        </a>
      </div>
=======
      <header>
        <Header />
      </header>
>>>>>>> 31a84d95ff1b01166c5a377f3c7ac91f059bb381
      <Outlet />
    </div>
  );
}