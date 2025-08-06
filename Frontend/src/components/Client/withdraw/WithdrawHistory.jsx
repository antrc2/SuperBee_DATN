import React, { useState } from "react";
import { ChevronDown, Pencil, XCircle, Inbox } from "lucide-react";

// Component StatusBadge được giữ nguyên sự đơn giản
const StatusBadge = ({ status }) => {
  const statusStyles = {
    0: { text: "Đang xử lý", className: "text-amber-600" },
    1: { text: "Thành công", className: "text-emerald-600" },
    2: { text: "Đã hủy", className: "text-gray-500" },
    3: { text: "Thất bại", className: "text-red-600" },
  };
  const currentStatus = statusStyles[status] || statusStyles[2];
  return (
    <span className={`font-semibold text-sm ${currentStatus.className}`}>
      {currentStatus.text}
    </span>
  );
};

// ĐỔI BỐ CỤC: Từ Card thành một hàng (Row) trong danh sách
const WithdrawRow = ({ item, onEdit, onCancelRequest }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    // Mỗi hàng được ngăn cách bằng một đường kẻ dưới
    <div className="border-b border-themed">
      {/* Phần thông tin chính luôn hiển thị */}
      <div className="flex items-center p-4">
        {/* Cột 1: Thông tin ngân hàng và số tiền */}
        <div className="flex-1">
          <p className="font-heading font-bold text-lg text-primary">
            {new Intl.NumberFormat("vi-VN").format(item.amount)} VNĐ
          </p>
          <p className="text-secondary text-sm">{item.bank_name}</p>
        </div>

        {/* Cột 2: Trạng thái */}
        <div className="w-1/4 flex justify-start">
          <StatusBadge status={item.status} />
        </div>

        {/* Cột 3: Nút xem chi tiết */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronDown
              size={20}
              className={`text-secondary transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Phần chi tiết được xổ xuống */}
      <div
        className={`transition-[max-height,padding] duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 pt-4 pb-5 ml-4 border-l-2 border-accent">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-secondary">Chủ tài khoản:</dt>
              <dd className="text-primary font-semibold">
                {item.account_holder_name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Số tài khoản:</dt>
              <dd className="text-primary font-mono">
                {item.bank_account_number}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Mã yêu cầu:</dt>
              <dd className="text-primary font-mono">{item.withdraw_code}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Ngày tạo:</dt>
              <dd className="text-secondary">
                {new Date(item.created_at).toLocaleString("vi-VN")}
              </dd>
            </div>
          </dl>
          {/* Các nút hành động chỉ hiển thị khi mở rộng và hợp lệ */}
          {item.status === 0 && (
            <div className="flex items-center space-x-3 pt-4 mt-3 border-t border-themed">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
              >
                <Pencil size={14} /> Sửa
              </button>
              <button
                onClick={() => onCancelRequest(item.id)}
                className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
              >
                <XCircle size={14} /> Hủy yêu cầu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component chính hiển thị danh sách
const WithdrawHistory = ({ data, onEdit, onCancelRequest }) => {
  if (!data || data.length === 0) {
    return (
      <div className="section-bg text-center py-20 px-6 text-secondary rounded-lg flex flex-col items-center justify-center">
        <Inbox
          className="text-gray-400 dark:text-gray-500 mb-4"
          size={48}
          strokeWidth={1.5}
        />
        <h3 className="font-heading text-xl font-bold text-primary mb-1">
          Lịch sử trống
        </h3>
        <p className="text-sm max-w-xs">
          Các yêu cầu rút tiền của bạn sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    // Bọc danh sách trong một div với nền và bo tròn
    <div className="section-bg rounded-lg">
      {data.map((item) => (
        <WithdrawRow
          key={item.id}
          item={item}
          onEdit={onEdit}
          onCancelRequest={onCancelRequest}
        />
      ))}
    </div>
  );
};

export default WithdrawHistory;
