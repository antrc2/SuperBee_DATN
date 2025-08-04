import { useState, useEffect } from "react";
import api from "@utils/http";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import { getDecodedToken } from "@utils/tokenUtils";
// Import các component con
import UserProfileSidebar from "./components/UserInfoCard";
import DataTable from "./components/DataTable";
import FinancialStatCard from "./components/FinancialStatCard";
import OrderCard from "./components/OrderCard";
import RoleManagementTab from "./components/RoleManagementTab"; // <-- Import component mới
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import { usePermissions } from "@utils/usePermissions";
// --- Helpers (Giữ nguyên) ---
const formatCurrency = (amount, currency = "VND") => {
  if (amount === null || amount === undefined) return "0 VND";
  return Number(amount).toLocaleString("vi-VN") + ` ${currency}`;
};
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN");
};
const getTransactionStatus = (status) => {
  const statuses = {
    0: (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        Đang chờ
      </span>
    ),
    1: (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        Hoàn thành
      </span>
    ),
    2: (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
        Thất bại
      </span>
    ),
  };
  return statuses[status] || <span className="text-gray-400">Không rõ</span>;
};
const getTransactionTypeLabel = (type) => {
  const types = {
    recharge_card: "Nạp thẻ cào",
    recharge_bank: "Nạp ngân hàng",
    purchase: "Mua hàng",
    withdraw: "Rút tiền",
    commission: "Hoa hồng",
    refund: "Hoàn tiền",
  };
  return (
    <span className="font-medium text-zinc-800 dark:text-zinc-200">
      {types[type] || type}
    </span>
  );
};

// --- Main Component ---
const ShowAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pop, conFim } = useNotification();

  // ----- State Management -----
  const [account, setAccount] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  // State và logic được chuyển từ trang cũ vào đây
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { can, hasRole } = usePermissions();
  const isRole = can("roles.edit");
  const ishasRole = hasRole("admin");

  // ----- Data Fetching -----
  useEffect(() => {
    const decoded = getDecodedToken();
    if (decoded) {
      setCurrentUser({ id: decoded.user_id });
    }
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/accounts/${id}`);
        const userData = res.data?.data?.user || null;
        setAccount(userData);
        setAllRoles(res.data?.data?.role || []);
        if (userData && userData.roles) {
          setSelectedRoles(userData.roles.map((role) => role.name));
        }
      } catch (err) {
        setError(err);
        pop(
          "Lỗi khi tải thông tin tài khoản: " +
            (err.response?.data?.message || err.message),
          "e"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id, pop]);

  // ----- Logic xử lý quyền -----
  const handleRoleChange = (roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((name) => name !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSaveChanges = async () => {
    if (!currentUser) {
      pop("Không thể xác thực người dùng hiện tại.", "e");
      return;
    }
    const check = await conFim("Bạn xác nhận hành động");
    if (!check) {
      setSelectedRoles(account.roles.map((role) => role.name));

      return;
    }
    setUpdatingRole(true);
    try {
      await api.put(`/admin/accounts/${id}/role`, {
        roles: selectedRoles,
        user_id: currentUser.id,
      });
      pop("Cập nhật quyền thành công!", "s");

      navigate("/admin/users");
    } catch (err) {
      pop(
        "Lỗi cập nhật quyền: " + (err.response?.data?.message || err.message),
        "e"
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  // ----- UI Rendering -----
  if (loading) return <LoadingDomain />;
  if (error)
    return (
      <div className="p-8 text-red-500">Lỗi tải dữ liệu: {error.message}</div>
    );
  if (!account)
    return (
      <div className="p-8 text-center text-zinc-500">
        Không tìm thấy tài khoản.
      </div>
    );

  // ----- Table & Calculated Values (Giữ nguyên) -----
  const transactionColumns = [
    {
      header: "Loại",
      key: "type",
      render: (tx) => getTransactionTypeLabel(tx.type),
    },
    {
      header: "Số tiền",
      key: "amount",
      render: (tx) => (
        <span
          className={`${
            tx.amount > 0 ? "text-green-600" : "text-red-600"
          } font-semibold`}
        >
          {tx.amount > 0 ? "+" : ""}
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (tx) => getTransactionStatus(tx.status),
    },
    {
      header: "Thời gian",
      key: "created_at",
      render: (tx) => formatDate(tx.created_at),
    },
  ];
  const totalRechargeAmount =
    (account.recharge_cards?.reduce(
      (s, i) => s + parseFloat(i.amount || 0),
      0
    ) || 0) +
    (account.recharge_banks?.reduce(
      (s, i) => s + parseFloat(i.amount || 0),
      0
    ) || 0);
  const totalWithdrawalAmount =
    account.withdrawals?.reduce((s, i) => s + parseFloat(i.amount || 0), 0) ||
    0;
  const totalOrderAmount =
    account.orders?.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0) ||
    0;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialStatCard
              title="Số dư hiện tại"
              value={formatCurrency(account.wallet?.balance)}
              colorClasses={{
                bg: "bg-blue-50 dark:bg-blue-900/50",
                iconBg: "bg-blue-100 dark:bg-blue-900",
                title: "text-blue-800 dark:text-blue-300",
                value: "text-blue-900 dark:text-blue-200",
              }}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600 dark:text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
            <FinancialStatCard
              title="Tổng tiền đã nạp"
              value={formatCurrency(totalRechargeAmount)}
              colorClasses={{
                bg: "bg-green-50 dark:bg-green-900/50",
                iconBg: "bg-green-100 dark:bg-green-900",
                title: "text-green-800 dark:text-green-300",
                value: "text-green-900 dark:text-green-200",
              }}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600 dark:text-green-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <FinancialStatCard
              title="Tổng tiền đã rút"
              value={formatCurrency(totalWithdrawalAmount)}
              colorClasses={{
                bg: "bg-red-50 dark:bg-red-900/50",
                iconBg: "bg-red-100 dark:bg-red-900",
                title: "text-red-800 dark:text-red-300",
                value: "text-red-900 dark:text-red-200",
              }}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600 dark:text-red-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
              }
            />
            <FinancialStatCard
              title="Tổng tiền mua hàng"
              value={formatCurrency(totalOrderAmount)}
              colorClasses={{
                bg: "bg-purple-50 dark:bg-purple-900/50",
                iconBg: "bg-purple-100 dark:bg-purple-900",
                title: "text-purple-800 dark:text-purple-300",
                value: "text-purple-900 dark:text-purple-200",
              }}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600 dark:text-purple-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
              }
            />
          </div>
        );
      case "transactions":
        return (
          <DataTable
            columns={transactionColumns}
            data={account.wallet?.transactions}
            emptyMessage="Không có giao dịch ví nào."
          />
        );
      case "orders":
        return account.orders && account.orders.length > 0 ? (
          <div className="space-y-4">
            {account.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={[]}
            data={[]}
            emptyMessage="Người dùng chưa có đơn hàng nào."
          />
        );
      // --- RENDER TAB MỚI ---
      case "role": {
        return isRole ? (
          <RoleManagementTab
            allRoles={allRoles}
            selectedRoles={selectedRoles}
            handleRoleChange={handleRoleChange}
            handleSaveChanges={handleSaveChanges}
            updatingRole={updatingRole}
            targetUser={account}
          />
        ) : (
          <span></span>
        );
      }
      default:
        return (
          <DataTable
            columns={[]}
            data={account[activeTab]}
            emptyMessage="Không có dữ liệu cho mục này."
          />
        );
    }
  };

  return (
    <div className="font-sans bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 min-h-screen">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <button
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            onClick={() => navigate(-1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Quay lại danh sách
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <UserProfileSidebar
              account={account}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-5 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowAccountPage;
