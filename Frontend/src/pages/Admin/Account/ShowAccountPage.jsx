import { useState, useEffect } from "react";
import api from "@utils/http";
import { useParams, useNavigate } from "react-router-dom";

const roles = {
  1: "Người dùng",
  2: "Cộng tác viên",
  3: "Đại lý",
};

const ShowAccountPage = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await api.get(`/accounts/${id}`);
        setAccount(res.data?.data ?? res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error)
    return (
      <div className="text-red-500">
        Lỗi tải dữ liệu: {error.message}
        <pre>{JSON.stringify(error.response?.data, null, 2)}</pre>
      </div>
    );
  if (!account) return <div>Không tìm thấy tài khoản.</div>;

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  return (
    <div className="p-6 max-w-5xl w-full mx-auto">
      <button
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </button>

      <div className="bg-white shadow-lg rounded-lg p-6 md:flex md:items-start md:gap-6">
        <div className="flex-shrink-0 text-center md:text-left">
          <img
            src={account.avatar_url || "https://via.placeholder.com/100"}
            className="w-28 h-28 rounded-full border mx-auto md:mx-0 mb-4"
            alt="Avatar"
          />
          <h2 className="text-xl font-semibold">{account.username}</h2>
          <p className="text-gray-600">{account.email}</p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-6 md:mt-0">
          <div>
            <strong>ID:</strong> {account.id}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {account.phone || "Chưa cập nhật"}
          </div>
          <div>
            <strong>Người giới thiệu:</strong> {account.affiliated_by || "Không có"}
          </div>
          <div>
            <strong>Quyền:</strong> {roles[account.role_id] || "Không rõ"}
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            {account.status === 1 ? (
              <span className="text-green-600 font-medium">✅ Hoạt động</span>
            ) : (
              <span className="text-red-500 font-medium">🚫 Bị khóa</span>
            )}
          </div>
          <div>
            <strong>Số dư ví:</strong>{" "}
            {account.wallet?.currency
              ? `${Number(account.wallet.balance || 0).toLocaleString()} ${account.wallet.currency}`
              : "0 VND"}
          </div>
          <div>
            <strong>Ngày tạo:</strong> {formatDate(account.created_at)}
          </div>
          <div>
            <strong>Cập nhật lần cuối:</strong> {formatDate(account.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowAccountPage;
