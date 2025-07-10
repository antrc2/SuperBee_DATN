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
  AlertCircle,
  Loader,
} from "lucide-react";
import api from "@utils/http";

// Utility Functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
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
  }).format(amount || 0);
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
      <span
        className="px-3 py-1 text-xs font-medium rounded-full"
        style={{
          backgroundColor: "var(--status-success-bg)",
          color: "var(--status-success-text)",
          border: "1px solid var(--status-success-border)",
        }}
      >
        Thành công
      </span>
    );
  }
  return (
    <span
      className="px-3 py-1 text-xs font-medium rounded-full"
      style={{
        backgroundColor: "var(--status-processing-bg)",
        color: "var(--status-processing-text)",
        border: "1px solid var(--status-processing-border)",
      }}
    >
      Đang xử lý
    </span>
  );
};

// Transaction Detail Modal Component
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
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
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
              {transaction.type.includes("recharge") ? "+ " : "- "}
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

        <div className="p-6 border-t border-slate-700 bg-slate-800/50 text-right">
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

// Main Page Component
const TransactionHistoryPage = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/user/history-trans");
        const transactionsData = res?.data[0]?.wallet?.transactions || [];
        const sortedTransactions = transactionsData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAllTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
      } catch (err) {
        setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader
            className="w-12 h-12 animate-spin mb-4"
            style={{ color: "var(--accent-primary)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <p
          className="text-center p-10"
          style={{ color: "var(--text-secondary)" }}
        >
          Không tìm thấy giao dịch nào.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 rounded-lg border border-transparent transition-all duration-300"
            style={{
              backgroundColor: "var(--bg-content-800)",
              ":hover": { borderColor: "var(--accent-primary)" },
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "var(--bg-content-700)" }}
                >
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {translateTransactionType(transaction.type)}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              {renderStatus(transaction.status)}
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Số tiền
                </p>
                <p
                  className={`text-lg font-bold ${
                    transaction.type.includes("recharge")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {transaction.type.includes("recharge") ? "+ " : "- "}{" "}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <button
                onClick={() => handleViewDetails(transaction)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <Eye className="h-4 w-4" />
                Xem
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "var(--bg-content-800)" }}
          >
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Lịch sử giao dịch
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Theo dõi các giao dịch ví của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-6 rounded-xl border mb-6"
        style={{
          backgroundColor: "var(--bg-content-800)",
          borderColor: "var(--bg-content-700)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Loại giao dịch
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--bg-content-700)",
                borderColor: "var(--bg-content-700)",
                color: "var(--text-primary)",
              }}
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
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--bg-content-700)",
                borderColor: "var(--bg-content-700)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">Tất cả</option>
              <option value="1">Thành công</option>
              <option value="0">Đang xử lý</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--bg-content-700)",
                borderColor: "var(--bg-content-700)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor: "var(--bg-content-700)",
                borderColor: "var(--bg-content-700)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TransactionHistoryPage;
