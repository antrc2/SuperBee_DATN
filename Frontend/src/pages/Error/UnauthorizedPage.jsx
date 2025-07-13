import React from "react";
import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react"; // Thay Skull bằng icon phù hợp hơn

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-2xl animate-blob animation-delay-2000"></div>

      <div className="relative text-center bg-dropdown backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-md w-full border border-themed transform -rotate-2">
        <ShieldOff className="w-24 h-24 mx-auto mb-6 text-red-500 animate-pulse drop-shadow-lg" />
        <h1 className="text-8xl font-black font-heading text-red-500 mb-2">
          403
        </h1>
        <p className="text-2xl font-bold font-heading text-primary mb-4">
          Khu Vực Cấm!
        </p>
        <p className="text-base text-secondary mb-8 leading-relaxed">
          Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra
          lại quyền hạn của tài khoản.
        </p>
        <Link
          to="/"
          className="action-button bg-gradient-danger text-white !w-auto"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
