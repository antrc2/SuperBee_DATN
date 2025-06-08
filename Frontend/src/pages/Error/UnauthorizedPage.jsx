// src/pages/OtherPage/UnauthorizedPage.jsx

import React from "react";
import { useRouteError, Link } from "react-router-dom";

const UnauthorizedPage = () => {
  const error = useRouteError(); // Lấy lỗi từ loader

  // Kiểm tra nếu lỗi là một Response object từ loader
  if (error instanceof Response && error.status === 403) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>403 - Forbidden</h1>
        <p>{error.statusText || "Bạn không có quyền truy cập trang này."}</p>
        <Link to="/login">Đăng nhập</Link>
      </div>
    );
  }

  // Xử lý các loại lỗi khác nếu có
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Oops!</h1>
      <p>Có lỗi xảy ra.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
};

export default UnauthorizedPage;
