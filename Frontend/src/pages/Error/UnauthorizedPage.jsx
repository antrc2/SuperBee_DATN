// src/pages/OtherPage/UnauthorizedPage.jsx

import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  // Kiểm tra nếu lỗi là một Response object từ loader

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>403 - Forbidden</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
    </div>
  );
};

export default UnauthorizedPage;
