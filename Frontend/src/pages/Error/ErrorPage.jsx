// src/components/ErrorPage.jsx
import React from "react";

export default function ErrorPage({ message, onRetry }) {
  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h2>Đã xảy ra lỗi</h2>
      <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ padding: "8px 16px", marginTop: 10 }}
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
