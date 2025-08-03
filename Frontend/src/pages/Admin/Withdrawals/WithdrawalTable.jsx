import React from "react";
import { Edit } from "lucide-react";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    0: { text: "Chờ xử lý", color: "bg-yellow-500" },
    1: { text: "Thành công", color: "bg-green-500" },
    2: { text: "Đã Hủy", color: "bg-gray-500" },
    3: { text: "Thất bại", color: "bg-red-500" },
  };
  const config = statusConfig[status] || {
    text: "Không rõ",
    color: "bg-gray-400",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${config.color}`}
    >
      {config.text}
    </span>
  );
};

const WithdrawalTable = ({ withdrawals, onEdit }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-300">
          <tr>
            <th className="px-4 py-3">Mã GD</th>
            <th className="px-4 py-3">Người dùng</th>
            <th className="px-4 py-3">Số tiền</th>
            <th className="px-4 py-3">Ngân hàng</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {withdrawals.length > 0 ? (
            withdrawals.map((w) => (
              <tr
                key={w.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 font-medium">{w.withdraw_code}</td>
                <td className="px-4 py-3">{w.user.username}</td>
                <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat("vi-VN").format(w.amount)}đ
                </td>
                <td className="px-4 py-3">
                  {w.bank_name} - {w.bank_account_number}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={w.status} />
                </td>
                <td className="px-4 py-3">
                  {new Date(w.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  {w.status === 0 && (
                    <button
                      onClick={() => onEdit(w)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                Không có kết quả nào phù hợp
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalTable;
