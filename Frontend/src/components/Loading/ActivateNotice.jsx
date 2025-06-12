// src/components/ActivateNotice.jsx
import React from "react";

export default function ActivateNotice({ onRetry, errorMessage }) {
  return (
    <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
      <h2>Website chưa được kích hoạt</h2>
      <p>{errorMessage || "Vui lòng kích hoạt để tiếp tục."}</p>
      <button onClick={onRetry} style={{ padding: "8px 16px" }}>
        Thử lại
      </button>
      {/* Bạn có thể thêm link hướng dẫn admin hoặc liên hệ hỗ trợ */}
    </div>
  );
}
