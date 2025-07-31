import React from "react";

// SVG Icon cho cảnh báo
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 inline-block mr-3 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const WithdrawNotes = () => {
  return (
    // Sử dụng class 'alert' và 'alert-warning' từ theme.css
    <div className="alert alert-warning" role="alert">
      <div className="flex items-center mb-3">
        <WarningIcon />
        <h3 className="font-heading font-bold text-lg text-primary">
          Lưu ý quan trọng
        </h3>
      </div>
      <ul className="list-disc list-inside space-y-2 text-secondary text-sm pl-9">
        <li>
          Số tiền rút tối thiểu là{" "}
          <strong className="font-bold text-primary">10,001 VND</strong>.
        </li>
        <li>
          Vui lòng điền{" "}
          <strong className="font-bold text-primary">Tên chủ tài khoản</strong>{" "}
          IN HOA, KHÔNG DẤU.
        </li>
        <li>
          Hệ thống sẽ tự động xử lý yêu cầu của bạn. Mọi sai sót về thông tin
          tài khoản chúng tôi không chịu trách nhiệm.
        </li>
        <li>
          Yêu cầu rút tiền chưa được xử lý có thể được hủy trong lịch sử giao
          dịch.
        </li>
      </ul>
    </div>
  );
};

export default WithdrawNotes;
