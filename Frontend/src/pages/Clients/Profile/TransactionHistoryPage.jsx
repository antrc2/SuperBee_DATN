"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Filter,
  Calendar,
  Eye,
  X,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
} from "lucide-react";
import api from "@utils/http";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

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

const getTransactionIcon = (type) => {
  switch (type) {
    case "recharge_bank":
    case "recharge_card":
      return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
    case "purchase":
      return <ShoppingBag className="h-4 w-4 text-blue-400" />;
    case "withdraw":
      return <ArrowUpRight className="h-4 w-4 text-red-400" />;
    default:
      return <CreditCard className="h-4 w-4 text-slate-400" />;
  }
};

const renderStatus = (status) => {
  if (status === 1) {
    return (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
        Thành công
      </span>
    );
  }
  return (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
      Đang xử lý
    </span>
  );
};

const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const renderDetails = () => {
    switch (transaction.type) {
      case "purchase":
        return (
          <div className="space-y-3">
            <h4 className="font-bold text-white">Chi tiết đơn hàng</h4>
            {transaction.order ? (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã đơn hàng:</span>
                  <span className="text-white font-mono">
                    #{transaction.order.order_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổng tiền:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(transaction.order.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã giảm giá:</span>
                  <span className="text-white">
                    {transaction.order.promo_code || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tiền giảm:</span>
                  <span className="text-red-400">
                    {formatCurrency(transaction.order.discount_amount)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Không có thông tin chi tiết.</p>
            )}
          </div>
        );
      case "recharge_card":
        return (
          <div className="space-y-3">
            <h4 className="font-bold text-white">Chi tiết nạp thẻ</h4>
            {transaction.recharge_card ? (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nhà mạng:</span>
                  <span className="text-white">
                    {transaction.recharge_card.telco}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mệnh giá:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(transaction.recharge_card.value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Serial:</span>
                  <span className="text-white font-mono">
                    {transaction.recharge_card.serial}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã thẻ:</span>
                  <span className="text-white font-mono">
                    {transaction.recharge_card.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="text-green-400">
                    {transaction.recharge_card.message}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Không có thông tin chi tiết.</p>
            )}
          </div>
        );
      case "recharge_bank":
        return (
          <div className="space-y-3">
            <h4 className="font-bold text-white">Chi tiết nạp qua ngân hàng</h4>
            {transaction.recharge_bank ? (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã giao dịch:</span>
                  <span className="text-white font-mono">
                    {transaction.recharge_bank.transaction_reference}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Không có thông tin chi tiết.</p>
            )}
          </div>
        );
      case "withdraw":
        return (
          <div className="space-y-3">
            <h4 className="font-bold text-white">Chi tiết rút tiền</h4>
            {transaction.withdraw ? (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="text-white">
                    {transaction.withdraw.bank_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="text-white font-mono">
                    {transaction.withdraw.bank_account_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã rút tiền:</span>
                  <span className="text-white font-mono">
                    {transaction.withdraw.withdraw_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ghi chú:</span>
                  <span className="text-white">
                    {transaction.withdraw.note}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Không có thông tin chi tiết.</p>
            )}
          </div>
        );
      default:
        return (
          <p className="text-slate-400">
            Không có thông tin chi tiết cho loại giao dịch này.
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Chi tiết giao dịch
              </h3>
              <p className="text-slate-400 text-sm">#{transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 text-sm">Ngày:</span>
              <p className="text-white font-medium">
                {formatDate(transaction.created_at)}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Loại:</span>
              <p className="text-white font-medium">
                {translateTransactionType(transaction.type)}
              </p>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-sm">Số tiền:</span>
            <p
              className={`text-xl font-bold ${
                transaction.type.includes("recharge")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {transaction.type.includes("recharge") ? "+" : "-"}{" "}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div>
            <span className="text-slate-400 text-sm">Trạng thái:</span>
            <div className="mt-1">{renderStatus(transaction.status)}</div>
          </div>

          <hr className="border-slate-700" />

          {renderDetails()}
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TransactionHistoryPage() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const res = await api.get("/user/history-trans");
        const transactionsData = res?.data[0]?.wallet?.transactions || [];

        const sortedTransactions = transactionsData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setAllTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
      } catch (error) {
        console.log(error);
      }
    };
    getTransactions();
  }, []);

  useEffect(() => {
    let result = [...allTransactions];

    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.status !== "all") {
      result = result.filter((t) => t.status.toString() === filters.status);
    }

    if (filters.startDate) {
      result = result.filter(
        (t) => new Date(t.created_at) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Lịch sử giao dịch</h1>
            <p className="text-slate-400">Theo dõi các giao dịch ví của bạn</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <h3 className="font-medium text-white">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Loại giao dịch
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="recharge_bank">Nạp tiền (Ngân hàng)</option>
              <option value="recharge_card">Nạp tiền (Thẻ cào)</option>
              <option value="purchase">Thanh toán</option>
              <option value="withdraw">Rút tiền</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="1">Thành công</option>
              <option value="0">Đang xử lý</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="text-white">
                          {translateTransactionType(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        transaction.type.includes("recharge")
                          ? "text-green-400"
                          : "text-red-400"
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
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={handleCloseModal}
      />
    </div>
  );
}
