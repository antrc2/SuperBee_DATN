import React from "react";
import { Ghost, RefreshCw } from "lucide-react";

export default function ErrorPage({ message, onRetry }) {
  const onReload = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl animate-blob animation-delay-2000"></div>

      <div className="relative text-center bg-dropdown backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-sm w-full border border-themed transform rotate-2">
        <Ghost className="w-24 h-24 mx-auto mb-6 text-accent/80 animate-float drop-shadow-lg" />
        <h2 className="text-4xl font-bold font-heading text-primary mb-3">
          Ối! Có gì đó sai sai...
        </h2>
        <div className="alert alert-danger my-6">
          {message || "Đã xảy ra một lỗi không mong muốn. Vui lòng thử lại."}
        </div>
        {onRetry && (
          <button
            onClick={onReload}
            className="action-button action-button-primary !w-auto"
          >
            <RefreshCw className="w-5 h-5 mr-2 animate-spin-slow" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
