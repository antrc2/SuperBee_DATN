import React, { useEffect, useState } from "react";

import api from "@utils/http";

const MOCK_API_RESPONSE = [
  {
    id: 5,
    username: "admin",
    email: "admin@example.com",
    email_verified_at: null,
    phone: "0123456789",
    avatar_url:
      "https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg",
    donate_code: "222fef5a-ac71-491e-8d70-939909e7075c",
    web_id: 1,
    status: 1,
    created_at: "2025-06-09T05:40:21.000000Z",
    updated_at: "2025-06-09T05:40:21.000000Z",
    wallet: {
      id: 3,
      user_id: 5,
      balance: "200",
      currency: "VND",
      created_at: "2025-06-09T05:40:21.000000Z",
      updated_at: "2025-06-09T05:40:21.000000Z",
      transactions: [
        {
          id: 1,
          wallet_id: 3,
          type: "recharge_bank",
          amount: "100",
          related_id: null,
          related_type: null,
          status: 1,
          created_at: "2025-06-09T05:40:21.000000Z",
          updated_at: "2025-06-09T05:40:21.000000Z",
          withdraw: null,
          recharge_bank: null,
          recharge_card: null,
          order: null,
        },
        {
          id: 2,
          wallet_id: 3,
          type: "purchase",
          amount: "30",
          related_id: 1,
          related_type: "App\\Models\\Order",
          status: 1,
          created_at: "2025-06-10T05:40:21.000000Z",
          updated_at: "2025-06-10T05:40:21.000000Z",
          withdraw: null,
          recharge_bank: null,
          recharge_card: null,
          order: {
            id: 2,
            user_id: 5,
            order_code: "435252452",
            total_amount: "345353",
            wallet_transaction_id: 2,
            status: 1,
            promo_code: "453",
            discount_amount: "5345",
            created_at: "2025-06-13T10:06:27.000000Z",
            updated_at: "2025-06-13T10:06:28.000000Z",
          },
        },
        {
          id: 3,
          wallet_id: 3,
          type: "recharge_card",
          amount: "100",
          related_id: 3,
          related_type: "App\\Models\\RechargeCard",
          status: 1,
          created_at: "2025-06-11T05:40:21.000000Z",
          updated_at: "2025-06-11T05:40:21.000000Z",
          withdraw: null,
          recharge_bank: null,
          recharge_card: {
            id: 1,
            wallet_transaction_id: 3,
            user_id: 1,
            web_id: 1,
            amount: 100,
            value: 100000,
            declared_value: 100000,
            telco: "Viettel",
            serial: "VT123456789E4A",
            code: "VTCODE987654321G4B",
            status: 1,
            message: "Card accepted",
            donate_promotion_id: null,
            created_at: "2025-06-09T05:40:21.000000Z",
            updated_at: "2025-06-09T05:40:21.000000Z",
          },
          order: null,
        },
        {
          id: 4,
          wallet_id: 3,
          type: "recharge_bank",
          amount: "200",
          related_id: 4,
          related_type: "App\\Models\\RechargeBank",
          status: 1,
          created_at: "2025-06-12T05:40:21.000000Z",
          updated_at: "2025-06-12T05:40:21.000000Z",
          withdraw: null,
          recharge_bank: {
            id: 1,
            wallet_transaction_id: 4,
            user_id: 2,
            web_id: 1,
            amount: "200",
            transaction_reference: "BANKTXN001-c6l15",
            status: 1,
            donate_promotion_id: null,
            created_at: "2025-06-09T05:40:21.000000Z",
            updated_at: "2025-06-09T05:40:21.000000Z",
          },
          recharge_card: null,
          order: null,
        },
        {
          id: 5,
          wallet_id: 3,
          type: "withdraw",
          amount: "50",
          related_id: null,
          related_type: null,
          status: 0,
          created_at: "2025-06-13T05:40:21.000000Z",
          updated_at: "2025-06-13T05:40:21.000000Z",
          withdraw: {
            id: 1,
            wallet_transaction_id: 5,
            user_id: 1,
            amount: "50",
            bank_account_number: "1234567890",
            bank_name: "UserBank",
            withdraw_code: "AWDFWAGDF65468",
            note: "Withdrawal request",
            status: 0,
            created_at: "2025-06-09T05:40:21.000000Z",
            updated_at: "2025-06-09T05:40:21.000000Z",
          },
          recharge_bank: null,
          recharge_card: null,
          order: null,
        },
      ],
    },
  },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// "Dịch" loại giao dịch sang tiếng Việt
const translateTransactionType = (type) => {
  switch (type) {
    case "recharge_bank":
      return "Nạp tiền (Ngân hàng)";
    case "recharge_card":
      return "Nạp tiền (Thẻ cào)";
    case "purchase":
      return "Thanh toán đơn hàng";
    case "withdraw":
      return "Rút tiền";
    default:
      return "Không xác định";
  }
};

// Hiển thị trạng thái với màu sắc
const renderStatus = (status) => {
  if (status === 1) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        Thành công
      </span>
    );
  }
  return (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
      Đang xử lý
    </span>
  );
};

// --- Component Modal để xem chi tiết ---
const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const renderDetails = () => {
    switch (transaction.type) {
      case "purchase":
        return (
          <>
            <h4 className="font-bold">Chi tiết đơn hàng</h4>
            {transaction.order ? (
              <ul>
                <li>Mã đơn hàng: {transaction.order.order_code}</li>
                <li>
                  Tổng tiền: {formatCurrency(transaction.order.total_amount)}
                </li>
                <li>Mã giảm giá: {transaction.order.promo_code}</li>
                <li>
                  Số tiền giảm:{" "}
                  {formatCurrency(transaction.order.discount_amount)}
                </li>
              </ul>
            ) : (
              <p>Không có thông tin chi tiết.</p>
            )}
          </>
        );
      case "recharge_card":
        return (
          <>
            <h4 className="font-bold">Chi tiết nạp thẻ</h4>
            {transaction.recharge_card ? (
              <ul>
                <li>Nhà mạng: {transaction.recharge_card.telco}</li>
                <li>
                  Mệnh giá: {formatCurrency(transaction.recharge_card.value)}
                </li>
                <li>Serial: {transaction.recharge_card.serial}</li>
                <li>Mã thẻ: {transaction.recharge_card.code}</li>
                <li>Trạng thái: {transaction.recharge_card.message}</li>
              </ul>
            ) : (
              <p>Không có thông tin chi tiết.</p>
            )}
          </>
        );
      case "recharge_bank":
        return (
          <>
            <h4 className="font-bold">Chi tiết nạp qua ngân hàng</h4>
            {transaction.recharge_bank ? (
              <ul>
                <li>
                  Mã giao dịch ngân hàng:{" "}
                  {transaction.recharge_bank.transaction_reference}
                </li>
              </ul>
            ) : (
              <p>Không có thông tin chi tiết.</p>
            )}
          </>
        );
      case "withdraw":
        return (
          <>
            <h4 className="font-bold">Chi tiết rút tiền</h4>
            {transaction.withdraw ? (
              <ul>
                <li>Ngân hàng: {transaction.withdraw.bank_name}</li>
                <li>
                  Số tài khoản: {transaction.withdraw.bank_account_number}
                </li>
                <li>Mã rút tiền: {transaction.withdraw.withdraw_code}</li>
                <li>Ghi chú: {transaction.withdraw.note}</li>
              </ul>
            ) : (
              <p>Không có thông tin chi tiết.</p>
            )}
          </>
        );
      default:
        return <p>Không có thông tin chi tiết cho loại giao dịch này.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Chi tiết giao dịch #{transaction.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <strong>Ngày:</strong> {formatDate(transaction.created_at)}
          </div>
          <div>
            <strong>Loại:</strong> {translateTransactionType(transaction.type)}
          </div>
          <div>
            <strong>Số tiền:</strong>{" "}
            <span
              className={
                transaction.type.includes("recharge")
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div>
            <strong>Trạng thái:</strong> {renderStatus(transaction.status)}
          </div>
          <hr />
          <div className="text-sm">{renderDetails()}</div>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component chính ---
export default function TransactionHistoryPage() {
  // State để lưu trữ toàn bộ giao dịch gốc từ API
  const [allTransactions, setAllTransactions] = useState([]);
  // State để lưu trữ các giao dịch đã được lọc để hiển thị
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  // State cho các giá trị của bộ lọc
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });
  // State để điều khiển modal chi tiết
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Lấy dữ liệu khi component được mount
  useEffect(() => {
    const getTransactions = async () => {
      try {
        // --- Thay thế đoạn này bằng API call thật của bạn ---
        // const res = await api.get("/user/history-trans");
        // const transactionsData = res.data[0]?.wallet?.transactions || [];
        const res = await api.get("/user/history-trans");
        // Dùng dữ liệu giả lập
        const transactionsData = res?.data[0]?.wallet?.transactions || [];

        // Sắp xếp giao dịch mới nhất lên đầu
        const sortedTransactions = transactionsData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setAllTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
      } catch (error) {
        console.log(error);
        // Có thể thêm state để hiển thị lỗi cho người dùng
      }
    };
    getTransactions();
  }, []);

  // Lọc lại danh sách giao dịch mỗi khi `filters` hoặc `allTransactions` thay đổi
  useEffect(() => {
    let result = [...allTransactions];

    // Lọc theo loại giao dịch
    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    // Lọc theo trạng thái
    if (filters.status !== "all") {
      result = result.filter((t) => t.status.toString() === filters.status);
    }

    // Lọc theo ngày bắt đầu
    if (filters.startDate) {
      result = result.filter(
        (t) => new Date(t.created_at) >= new Date(filters.startDate)
      );
    }

    // Lọc theo ngày kết thúc
    if (filters.endDate) {
      // Thêm 1 ngày để bao gồm cả ngày kết thúc
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      result = result.filter((t) => new Date(t.created_at) < endDate);
    }

    setFilteredTransactions(result);
  }, [filters, allTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử giao dịch</h1>

      {/* --- Khu vực bộ lọc --- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Loại giao dịch
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="recharge_bank">Nạp tiền (Ngân hàng)</option>
              <option value="recharge_card">Nạp tiền (Thẻ cào)</option>
              <option value="purchase">Thanh toán</option>
              <option value="withdraw">Rút tiền</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="1">Thành công</option>
              <option value="0">Đang xử lý</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Từ ngày
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Đến ngày
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div className="overflow-x-auto">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {translateTransactionType(transaction.type)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-semibold ${
                      transaction.type.includes("recharge")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type.includes("recharge") ? "+" : "-"}{" "}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(transaction)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  Không tìm thấy giao dịch nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal chi tiết --- */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={handleCloseModal}
      />
    </div>
  );
}
