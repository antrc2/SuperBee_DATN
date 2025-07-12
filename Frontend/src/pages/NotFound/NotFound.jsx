import React from "react";
import { Link } from "react-router-dom";
import { Map, Compass, Home } from "lucide-react";
import PageMeta from "@components/Admin/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="404 - Lạc đường rồi!"
        description="Oops! Trang bạn tìm kiếm không tồn tại."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-gradient-to-br from-background to-secondary/20">
        {/* Decorative background blobs using theme colors */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-tertiary/10 rounded-full blur-2xl animate-float-slow animation-delay-2000"></div>

        <div className="relative z-10 text-center bg-dropdown backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-themed transform -rotate-1">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Map className="w-20 h-20 text-accent/80 animate-pulse drop-shadow-lg" />
            <Compass className="w-20 h-20 text-accent/80 animate-spin-slow drop-shadow-lg" />
          </div>

          <h1 className="text-8xl font-black font-heading text-accent mb-2 tracking-wider">
            404
          </h1>
          <p className="text-2xl font-bold font-heading text-primary mb-4">
            Ôi không! Lạc mất rồi!
          </p>
          <p className="text-base text-secondary mb-8 leading-relaxed">
            Bản đồ không hiển thị trang này. Có vẻ như nó đã bị một thế lực siêu
            nhiên nào đó giấu đi mất rồi.
          </p>

          <Link to="/" className="action-button action-button-primary !w-auto">
            <Home className="w-5 h-5 mr-2" />
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </>
  );
}
