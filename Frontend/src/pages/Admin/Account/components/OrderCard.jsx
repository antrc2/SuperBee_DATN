import React from "react";

// Helper để format số tiền
const formatCurrency = (amount, currency = "VND") => {
  if (amount === null || amount === undefined) return "0 VND";
  return Number(amount).toLocaleString("vi-VN") + ` ${currency}`;
};

// Helper để format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN");
};

const getOrderStatus = (status) => {
  switch (status) {
    case 0:
      return <span className="text-yellow-600">Đang chờ</span>;
    case 1:
      return <span className="text-green-600">Hoàn thành</span>;
    case 2:
      return <span className="text-red-600">Đã hủy</span>;
    default:
      return <span className="text-gray-500">Không rõ</span>;
  }
};

const OrderCard = ({ order }) => {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mb-3">
        <div>
          <strong className="text-gray-700 dark:text-gray-300">
            Mã đơn hàng:
          </strong>
          <span className="text-indigo-700 dark:text-indigo-400 font-medium ml-2">
            {order.order_code}
          </span>
        </div>
        <div>
          <strong className="text-gray-700 dark:text-gray-300">
            Tổng tiền:
          </strong>
          <span className="text-green-700 dark:text-green-400 font-bold ml-2">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
        <div>
          <strong className="text-gray-700 dark:text-gray-300">
            Trạng thái:
          </strong>
          <span className="ml-2">{getOrderStatus(order.status)}</span>
        </div>
        <div>
          <strong className="text-gray-700 dark:text-gray-300">
            Ngày đặt:
          </strong>
          <span className="ml-2">{formatDate(order.created_at)}</span>
        </div>
      </div>
      {order.items && order.items.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Chi tiết sản phẩm:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-400">
            {order.items.map((item) => (
              <li key={item.id}>
                Sản phẩm ID: {item.product_id} - Số lượng: {item.quantity} -
                Giá: {formatCurrency(item.unit_price)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
