import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingDomain from "@components/Loading/LoadingDomain";

// --- Icons ---
const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.51.054.994.093 1.485.127a18.154 18.154 0 010 2.863m-7.5 0a9.094 9.094 0 013.741-.479 3 3 0 014.682-2.72M13.5 5.25h3V7.5h-3V5.25zm-8.25 5.25h3V13.5h-3V10.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  </svg>
);

// --- Helper Components ---
const DetailItem = ({ label, value, children, className = "" }) => {
  if (value === null || (value === undefined && !children)) return null;
  return (
    <div
      className={`px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${className}`}
    >
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
        {children || value}
      </dd>
    </div>
  );
};
const StatusBadge = ({ status }) => {
  const isActived = status === 1;
  const badgeClasses = isActived
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${badgeClasses}`}
    >
      {isActived ? "Kích hoạt" : "Ẩn"}
    </span>
  );
};

const ShowDiscountCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pop } = useNotification();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await api.get(`/admin/discountcode/${id}`);
        setPromotion(response.data.data);
      } catch (error) {
        pop("Không thể tải thông tin khuyến mãi.", "e");
        navigate("/admin/discountcode");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotion();
  }, [id, navigate, pop]);

  const filteredUsers = useMemo(() => {
    if (!promotion?.promotion_user) return [];
    if (!searchTerm) return promotion.promotion_user;
    const lowercasedFilter = searchTerm.toLowerCase();
    return promotion.promotion_user.filter(
      ({ user }) =>
        user.username.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, promotion]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  if (loading) return <LoadingDomain />;
  if (!promotion)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-gray-900 text-red-500">
        Không có dữ liệu để hiển thị.
      </div>
    );

  const isForAllUsers =
    promotion.promotion_user_id === -1 ||
    !promotion.promotion_user ||
    promotion.promotion_user.length === 0;
  const creatorUser = promotion.user;

  const UserItem = ({ user }) => (
    <div key={user.id} className="p-4 flex items-center space-x-4">
      <img
        className="h-12 w-12 rounded-full object-cover bg-gray-100"
        src={user.avatar_url}
        alt={`Avatar of ${user.username}`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/48x48/e2e8f0/64748b?text=U";
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {user.username}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </p>
      </div>
      <Link
        to={`/admin/users/${user.id}`}
        className="flex-shrink-0 text-xs font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 hover:underline"
      >
        Xem
      </Link>
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 mb-2"
            >
              <BackIcon />
              Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chi tiết Khuyến Mãi
            </h1>
          </div>
          <div className="flex-shrink-0">
            <Link
              to={`/admin/discountcode/${id}/edit`}
              className="w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900"
            >
              <EditIcon />
              Chỉnh sửa
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                  Mã:{" "}
                  <span className="font-mono text-sky-600 dark:text-sky-400">
                    {promotion.code}
                  </span>
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {promotion.description || "Không có mô tả."}
                </p>
              </div>
              <dl>
                <DetailItem
                  label="Trạng thái"
                  className="bg-gray-50 dark:bg-gray-800/50"
                >
                  <StatusBadge status={promotion.status} />
                </DetailItem>
                <DetailItem
                  label="Phần trăm giảm"
                  value={`${promotion.discount_value}%`}
                />
                <DetailItem
                  label="Ngày bắt đầu"
                  value={formatDate(promotion.start_date)}
                  className="bg-gray-50 dark:bg-gray-800/50"
                />
                <DetailItem
                  label="Ngày kết thúc"
                  value={formatDate(promotion.end_date)}
                />
                <DetailItem
                  label="Tổng lượt đã dùng"
                  value={promotion.total_used}
                  className="bg-gray-50 dark:bg-gray-800/50"
                />
                <DetailItem
                  label="Tổng lượt sử dụng"
                  value={
                    promotion.usage_limit === -1
                      ? "Không giới hạn"
                      : promotion.usage_limit
                  }
                />
                <DetailItem
                  label="Lượt dùng/Người"
                  value={
                    promotion.per_user_limit === -1
                      ? "Không giới hạn"
                      : promotion.per_user_limit
                  }
                  className="bg-gray-50 dark:bg-gray-800/50"
                />
                <DetailItem
                  label="Giảm tối thiểu"
                  value={formatCurrency(promotion.min_discount_amount)}
                />
                <DetailItem
                  label="Giảm tối đa"
                  value={formatCurrency(promotion.max_discount_amount)}
                  className="bg-gray-50 dark:bg-gray-800/50"
                />
              </dl>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
                  Đối tượng áp dụng
                </h3>
              </div>
              {isForAllUsers ? (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-full">
                    <UsersIcon className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                    Tất cả người dùng
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mã này áp dụng cho mọi khách hàng.
                  </p>
                </div>
              ) : promotion.promotion_user.length > 5 ? (
                <div className="p-6 text-center">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full inline-block">
                    <UsersIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">
                    Áp dụng cho {promotion.promotion_user.length} người dùng
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 hover:underline"
                  >
                    Xem chi tiết &rarr;
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {promotion.promotion_user.map(({ user }) => (
                    <UserItem user={user} key={user.id} />
                  ))}
                </div>
              )}
            </div>
            {creatorUser && (
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
                    Người tạo
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={creatorUser.avatar_url}
                      alt={`Avatar of ${creatorUser.username}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/64x64/e2e8f0/64748b?text=User";
                      }}
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {creatorUser.username}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {creatorUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">
                          Website
                        </dt>
                        <dd className="text-gray-700 dark:text-gray-300 font-mono">
                          {creatorUser.web?.subdomain || "N/A"}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">
                          Ngày tạo
                        </dt>
                        <dd className="text-gray-700 dark:text-gray-300">
                          {formatDate(promotion.created_at)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Danh sách người dùng ({promotion.promotion_user.length})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(({ user }) => (
                  <UserItem user={user} key={user.id} />
                ))
              ) : (
                <p className="text-center text-gray-500 p-8">
                  Không tìm thấy người dùng nào.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowDiscountCodePage;
