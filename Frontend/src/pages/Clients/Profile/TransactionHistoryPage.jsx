import React from "react";

export default function TransactionHistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lịch sử giao dịch</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số tiền
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">2023-10-01</td>
            <td className="px-6 py-4 whitespace-nowrap">Nạp tiền</td>
            <td className="px-6 py-4 whitespace-nowrap">100.000đ</td>
            <td className="px-6 py-4 whitespace-nowrap">Thành công</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
