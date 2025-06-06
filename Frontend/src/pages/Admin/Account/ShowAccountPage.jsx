import { useState, useEffect } from "react";
import api from "@utils/http";
import { useParams, useNavigate } from "react-router-dom";

// Helper để format số tiền
const formatCurrency = (amount, currency = "VND") => {
  return Number(amount || 0).toLocaleString("vi-VN") + ` ${currency}`;
};

// Helper để format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN");
};

// Helper để map trạng thái giao dịch
const getTransactionStatus = (status) => {
  switch (status) {
    case 0:
      return <span className="text-yellow-600 font-medium">Đang chờ</span>;
    case 1:
      return <span className="text-green-600 font-medium">Hoàn thành</span>;
    case 2:
      return <span className="text-red-600 font-medium">Thất bại</span>;
    default:
      return <span className="text-gray-500">Không rõ</span>;
  }
};

// Helper để map trạng thái thẻ cào
const getRechargeCardStatus = (status) => {
  switch (status) {
    case 1:
      return <span className="text-green-600 font-medium">Thẻ đúng</span>;
    case 2:
      return <span className="text-red-600 font-medium">Sai mệnh giá</span>;
    case 3:
      return <span className="text-red-600 font-medium">Thẻ lỗi</span>;
    case 99:
      return <span className="text-yellow-600 font-medium">Đang xử lý</span>;
    default:
      return <span className="text-gray-500">Không rõ</span>;
  }
};

// Helper để map loại giao dịch ví
const getTransactionTypeLabel = (type) => {
  switch (type) {
    case "recharge_card":
      return "Nạp thẻ cào";
    case "recharge_bank":
      return "Nạp ngân hàng";
    case "purchase":
      return "Mua hàng";
    case "withdraw":
      return "Rút tiền";
    case "commission":
      return "Hoa hồng";
    case "refund":
      return "Hoàn tiền";
    default:
      return type;
  }
};

const ShowAccountPage = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // Mặc định là tab tổng quan
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await api.get(`/accounts/${id}`);
        // Đảm bảo lấy đúng dữ liệu 'user' từ cấu trúc phản hồi API của bạn
        setAccount(res.data?.data?.user || res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id]);

  if (loading)
    return <div className="text-center p-8">Đang tải dữ liệu...</div>;
  if (error)
    return (
      <div className="text-red-500 p-8">
        Lỗi tải dữ liệu: {error.message}
        <pre className="bg-gray-100 p-4 rounded mt-4">
          {JSON.stringify(error.response?.data, null, 2)}
        </pre>
      </div>
    );
  if (!account)
    return <div className="text-center p-8">Không tìm thấy tài khoản.</div>;

  // Tính toán tổng quan tài chính
  const totalRechargeCardAmount =
    account.recharge_cards?.reduce((sum, rc) => sum + rc.amount, 0) || 0;
  const totalRechargeBankAmount =
    account.recharge_banks?.reduce((sum, rb) => sum + rb.amount, 0) || 0;
  const totalRechargeAmount = totalRechargeCardAmount + totalRechargeBankAmount;
  const totalWithdrawalAmount =
    account.withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
  const totalOrderAmount =
    account.orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

  return (
    <div className="p-6 max-w-7xl w-full mx-auto bg-gray-50 min-h-screen">
      <button
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-2 text-gray-700 font-medium shadow-sm transition duration-200"
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
        Quay lại
      </button>

      <div className="bg-white shadow-xl rounded-xl p-8 mb-8">
        <div className="md:flex md:items-start md:gap-8">
          <div className="flex-shrink-0 text-center md:text-left mb-6 md:mb-0">
            <img
              src={account.avatar_url || "https://via.placeholder.com/150"}
              className="w-32 h-32 rounded-full border-4 border-blue-200 mx-auto md:mx-0 shadow-md object-cover"
              alt="Avatar"
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">
              {account.username}
            </h2>
            <p className="text-blue-600 text-lg">{account.email}</p>
            <p className="text-gray-600 mt-1">
              Quyền:{" "}
              <span className="font-semibold text-gray-700">
                {account.roles?.[0]?.name || "Không rõ"}
              </span>
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <div>
              <strong className="text-gray-700">ID người dùng:</strong>{" "}
              <span className="text-gray-900">{account.id}</span>
            </div>
            <div>
              <strong className="text-gray-700">Số điện thoại:</strong>{" "}
              <span className="text-gray-900">
                {account.phone || "Chưa cập nhật"}
              </span>
            </div>
            {/* <div>
              <strong className="text-gray-700">Mã giới thiệu:</strong>{" "}
              <span className="text-gray-900">
                {account.donate_code || "Không có"}
              </span>
            </div> */}
            <div>
              <strong className="text-gray-700">Trạng thái:</strong>{" "}
              {account.status === 1 ? (
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hoạt động
                </span>
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Bị khóa
                </span>
              )}
            </div>
            <div>
              <strong className="text-gray-700">Số dư ví:</strong>{" "}
              <span className="text-green-700 font-bold text-lg">
                {formatCurrency(
                  account.wallet?.balance,
                  account.wallet?.currency
                )}
              </span>
            </div>
            <div>
              <strong className="text-gray-700">Ngày tạo:</strong>{" "}
              <span className="text-gray-900">
                {formatDate(account.created_at)}
              </span>
            </div>
            <div>
              <strong className="text-gray-700">Cập nhật lần cuối:</strong>{" "}
              <span className="text-gray-900">
                {formatDate(account.updated_at)}
              </span>
            </div>
            <div>
              <strong className="text-gray-700">Subdomain:</strong>{" "}
              <span className="text-gray-900">
                {account.web?.subdomain || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tổng quan tài chính
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`${
                activeTab === "transactions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Lịch sử giao dịch ví
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`${
                activeTab === "orders"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("recharges")}
              className={`${
                activeTab === "recharges"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Lịch sử nạp tiền
            </button>
            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`${
                activeTab === "withdrawals"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Lịch sử rút tiền
            </button>
            <button
              onClick={() => setActiveTab("shareAccount")}
              className={`${
                activeTab === "shareAccount"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Người đã giới thiệu
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        {/* Tổng quan tài chính */}
        {activeTab === "overview" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Tổng quan tài chính
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600 text-sm">Tổng số dư hiện tại</p>
                <p className="text-blue-700 font-bold text-2xl">
                  {formatCurrency(
                    account.wallet?.balance,
                    account.wallet?.currency
                  )}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600 text-sm">Tổng tiền đã nạp</p>
                <p className="text-green-700 font-bold text-2xl">
                  {formatCurrency(
                    totalRechargeAmount,
                    account.wallet?.currency
                  )}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600 text-sm">Tổng tiền đã rút</p>
                <p className="text-red-700 font-bold text-2xl">
                  {formatCurrency(
                    totalWithdrawalAmount,
                    account.wallet?.currency
                  )}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600 text-sm">
                  Tổng tiền đơn hàng đã mua
                </p>
                <p className="text-purple-700 font-bold text-2xl">
                  {formatCurrency(totalOrderAmount, account.wallet?.currency)}
                </p>
              </div>
              {/* Có thể thêm tổng tiền hoa hồng hoặc các chỉ số khác */}
            </div>
          </div>
        )}

        {/* Lịch sử giao dịch ví */}
        {activeTab === "transactions" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Lịch sử giao dịch ví
            </h3>
            {account.wallet?.transactions &&
            account.wallet.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Loại
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Số tiền
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thời gian
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {account.wallet.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTransactionTypeLabel(tx.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`${
                              tx.amount > 0 ? "text-green-600" : "text-red-600"
                            } font-medium`}
                          >
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getTransactionStatus(tx.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tx.type === "recharge_card" && tx.recharge_card && (
                            <span>
                              Thẻ: {tx.recharge_card.telco} (
                              {tx.recharge_card.declared_value.toLocaleString()}
                              )
                            </span>
                          )}
                          {tx.type === "recharge_bank" && tx.recharge_bank && (
                            <span>
                              Ref:{" "}
                              {tx.recharge_bank.transaction_reference || "N/A"}
                            </span>
                          )}
                          {tx.type === "withdraw" && tx.withdrawal && (
                            <span>Ngân hàng: {tx.withdrawal.bank_name}</span>
                          )}
                          {tx.type === "purchase" && tx.order && (
                            <span>Mã đơn: {tx.order.order_code}</span>
                          )}
                          {/* Thêm các loại chi tiết khác nếu cần */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Không có giao dịch ví nào.</p>
            )}
          </div>
        )}

        {/* Đơn hàng */}
        {activeTab === "orders" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Danh sách đơn hàng
            </h3>
            {account.orders && account.orders.length > 0 ? (
              <div className="space-y-6">
                {account.orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div>
                        <strong className="text-gray-700">Mã đơn hàng:</strong>{" "}
                        <span className="text-blue-700 font-medium">
                          {order.order_code}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-700">Tổng tiền:</strong>{" "}
                        <span className="text-green-700 font-bold">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-700">Trạng thái:</strong>{" "}
                        {order.status === 0 && (
                          <span className="text-yellow-600">Đang chờ</span>
                        )}
                        {order.status === 1 && (
                          <span className="text-green-600">Hoàn thành</span>
                        )}
                        {order.status === 2 && (
                          <span className="text-red-600">Đã hủy</span>
                        )}
                      </div>
                      <div>
                        <strong className="text-gray-700">Ngày đặt:</strong>{" "}
                        {formatDate(order.created_at)}
                      </div>
                      {order.promo_code && (
                        <div>
                          <strong className="text-gray-700">Mã KM:</strong>{" "}
                          {order.promo_code}
                        </div>
                      )}
                      {order.discount_amount && (
                        <div>
                          <strong className="text-gray-700">Giảm giá:</strong>{" "}
                          {formatCurrency(order.discount_amount)}
                        </div>
                      )}
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <p className="font-semibold text-gray-700 mb-2">
                          Chi tiết sản phẩm:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              Sản phẩm ID: {item.product_id} - Giá:{" "}
                              {formatCurrency(item.unit_price)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Người dùng chưa có đơn hàng nào.</p>
            )}
          </div>
        )}

        {/* Lịch sử nạp tiền */}
        {activeTab === "recharges" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Lịch sử nạp tiền
            </h3>
            <h4 className="text-lg font-medium mb-2 text-gray-700">
              Nạp thẻ cào
            </h4>
            {account.recharge_cards && account.recharge_cards.length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mệnh giá khai báo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền nhận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhà mạng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {account.recharge_cards.map((rc) => (
                      <tr key={rc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rc.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(rc.declared_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(rc.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rc.telco}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getRechargeCardStatus(rc.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                          {rc.donate_promotion?.code || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rc.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Không có giao dịch nạp thẻ cào nào.
              </p>
            )}

            <h4 className="text-lg font-medium mb-2 text-gray-700">
              Nạp ngân hàng
            </h4>
            {account.recharge_banks && account.recharge_banks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã tham chiếu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {account.recharge_banks.map((rb) => (
                      <tr key={rb.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rb.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(rb.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rb.transaction_reference || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getTransactionStatus(rb.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                          {rb.donate_promotion?.code || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rb.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">
                Không có giao dịch nạp ngân hàng nào.
              </p>
            )}
          </div>
        )}

        {/* Lịch sử rút tiền */}
        {activeTab === "withdrawals" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Lịch sử rút tiền
            </h3>
            {account.withdrawals && account.withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngân hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STK
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {account.withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {w.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {formatCurrency(w.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {w.bank_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {w.bank_account_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getTransactionStatus(w.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(w.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Không có yêu cầu rút tiền nào.</p>
            )}
          </div>
        )}
        {/* danh sách người giới thiệu */}
        {activeTab === "shareAccount" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Người đã giới thiệu
            </h3>

            {account.referred_affiliates &&
            account.referred_affiliates.length > 0 ? (
              <ul className="list-disc list-inside mt-1 text-gray-900">
                {account.referred_affiliates.map((ref) => (
                  <li key={ref.id}>
                    {ref.user?.username || `ID: ${ref.user_id}`} (Affiliate ID:{" "}
                    {ref.id})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Không có giới thiệu.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowAccountPage;
