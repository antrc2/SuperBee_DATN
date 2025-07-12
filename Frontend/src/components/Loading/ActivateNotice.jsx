import React from "react";
import { PowerOff, RefreshCw } from "lucide-react"; // Icon phù hợp với "kích hoạt"

export default function ActivateNotice({ onRetry, errorMessage }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="relative text-center bg-dropdown backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-md w-full border border-themed">
        <div className="w-20 h-20 bg-accent/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <PowerOff className="w-12 h-12 text-accent animate-pulse" />
        </div>

        <h2 className="text-3xl font-bold font-heading text-primary mb-3">
          Website chưa được kích hoạt
        </h2>

        <p className="text-secondary mb-8 leading-relaxed">
          {errorMessage ||
            "Vui lòng kích hoạt trang web trong bảng quản trị để có thể tiếp tục sử dụng."}
        </p>

        <button
          onClick={onRetry}
          className="action-button action-button-primary !w-auto"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Thử lại
        </button>
      </div>
    </div>
  );
}
