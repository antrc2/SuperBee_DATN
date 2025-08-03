"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
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

// --- TIỆN ÍCH ---

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) amount = 0;
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

// --- COMPONENT CON: MODAL CHI TIẾT GIAO DỊCH ---
const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isRecharge = transaction.type.includes("recharge");

  const renderDetails = () => {
    if (transaction.type === "purchase" && transaction.order) {
      return (
        <div className="space-y-3">
          <h4 className="font-semibold text-primary">Chi tiết đơn hàng</h4>
          <div className="bg-background/50 p-4 rounded-lg border border-themed space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary">Mã đơn hàng:</span>
              <span className="text-primary font-mono">
                #{transaction.order.order_code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Tổng tiền:</span>
              <span className="text-primary font-medium">
                {formatCurrency(transaction.order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <p className="text-secondary text-sm">
        Không có thông tin chi tiết cho loại giao dịch này.
      </p>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-themed">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                Chi tiết giao dịch
              </h3>
              <p className="text-secondary text-sm font-mono">
                #{transaction.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-secondary">Ngày:</span>
              <p className="font-semibold text-primary">
                {formatDate(transaction.created_at)}
              </p>
            </div>
            <div>
              <span className="text-sm text-secondary">Loại:</span>
              <p className="font-semibold text-primary">
                {translateTransactionType(transaction.type)}
              </p>
            </div>
          </div>
          <div>
            <span className="text-sm text-secondary">Số tiền:</span>
            <p
              className={`text-2xl font-bold ${
                isRecharge ? "text-status-success-text" : "text-red-500"
              }`}
            >
              {isRecharge ? "+ " : "- "}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div>
            <span className="text-sm text-secondary">Trạng thái:</span>
            <div className="mt-1">{renderStatus(transaction.status)}</div>
          </div>
          <hr className="border-themed !my-6" />
          {renderDetails()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-themed bg-background/50 text-right">
          <button
            onClick={onClose}
            className="action-button action-button-secondary !w-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const getTransactionIcon = (type) => {
  switch (type) {
    case "recharge_bank":
    case "recharge_card":
      return <ArrowDownLeft className="h-5 w-5 text-status-success-text" />;
    case "purchase":
      return <ShoppingBag className="h-5 w-5 text-accent" />;
    case "withdraw":
      return <ArrowUpRight className="h-5 w-5 text-status-cancelled-text" />;
    default:
      return <CreditCard className="h-5 w-5 text-secondary" />;
  }
};

const renderStatus = (status) => {
  const statusMap = {
    1: {
      text: "Thành công",
      className: "bg-status-success-bg text-status-success-text",
    },
    0: {
      text: "Đang xử lý",
      className: "bg-status-processing-bg text-status-processing-text",
    },
  };
  const currentStatus = statusMap[status] || {
    text: "Không xác định",
    className: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full ${currentStatus.className}`}
    >
      {currentStatus.text}
    </span>
  );
};

export default function TransactionHistoryPage() {
  const [allTransactions, setAllTransactions] = useState([]);
  console.log(
    "🚀 ~ TransactionHistoryPage ~ allTransactions:",
    allTransactions
  );
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
        const transactionsData = res?.data?.wallet?.transactions || [];
        setAllTransactions(
          transactionsData.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        );
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
    let result = allTransactions.filter(
      (t) =>
        (filters.type === "all" || t.type === filters.type) &&
        (filters.status === "all" || t.status.toString() === filters.status) &&
        (!filters.startDate ||
          new Date(t.created_at) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(t.created_at) <
            new Date(
              new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            ))
    );
    setFilteredTransactions(result);
  }, [filters, allTransactions]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader className="w-12 h-12 animate-spin text-accent mb-4" />
          <p className="text-secondary">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <div className="text-center p-10 bg-background rounded-lg border border-themed">
          <Wallet className="w-12 h-12 mx-auto text-secondary/50 mb-4" />
          <p className="text-secondary">Không có giao dịch nào phù hợp.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-background p-4 rounded-xl border border-themed transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg section-bg">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    {translateTransactionType(transaction.type)}
                  </p>
                  <p className="text-sm text-secondary">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              {renderStatus(transaction.status)}
            </div>
            <div className="mt-4 pt-4 border-t border-themed flex justify-between items-end">
              <div>
                <p className="text-sm text-secondary">Số tiền</p>
                <p
                  className={`text-xl font-bold ${
                    transaction.type.includes("recharge")
                      ? "text-status-success-text"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type.includes("recharge") ? "+ " : "- "}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(transaction)}
                className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
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
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          Lịch sử giao dịch
        </h1>
        <p className="text-secondary mt-1">
          Theo dõi các khoản thu chi trong ví của bạn.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-background p-4 rounded-xl border border-themed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Loại giao dịch
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            >
              <option value="all">Tất cả</option>
              <option value="recharge_bank">Nạp tiền (Ngân hàng)</option>
              <option value="recharge_card">Nạp tiền (Thẻ cào)</option>
              <option value="purchase">Thanh toán</option>
              <option value="withdraw">Rút tiền</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            >
              <option value="all">Tất cả</option>
              <option value="1">Thành công</option>
              <option value="0">Đang xử lý</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[20rem]">{renderContent()}</div>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </section>
  );
}
