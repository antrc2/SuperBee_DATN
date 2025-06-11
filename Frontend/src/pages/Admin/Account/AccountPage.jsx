import { useState, useEffect } from "react";
import api from "@utils/http";
import { useNavigate } from "react-router-dom";

const AccountListPage = () => {
  const [filterRole, setFilterRole] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/admin/accounts");
        // Nếu API trả về { data: [...] }
        const list = res.data?.data?.user ?? res.data ?? [];
        const listRole = res.data?.data?.roles ?? res.data ?? [];
        setRoles(listRole);
        setAccounts(list);
      } catch (err) {
        // Log lỗi chi tiết để debug
        console.error("Lỗi khi tải danh sách:", err, err.response?.data);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleToggleStatus = async (id, status) => {
    try {
      if (status === 1) {
        await api.delete(`/admin/accounts/${id}`);
      } else {
        await api.patch(`/admin/accounts/${id}`);
      }
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, status: status === 1 ? 0 : 1 } : acc
        )
      );
    } catch (err) {
      alert("Thao tác thất bại");
      console.error(err);
    }
  };

  const filteredAccounts =
    filterRole === 0
      ? accounts
      : accounts.filter((acc) => acc.roles?.[0]?.pivot?.role_id === filterRole);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý tài khoản</h1>
      <div className="mb-4">
        <label className="mr-2 font-medium">Lọc theo quyền:</label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          <option value={0}>Tất cả</option>
          <option value={1}>Admin</option>
          <option value={2}>Người dùng</option>
          <option value={3}>Cộng tác viên</option>
          <option value={4}>Đại lý</option>
        </select>
      </div>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500">
          Lỗi tải dữ liệu: {error.message}
          <pre>{JSON.stringify(error.response?.data, null, 2)}</pre>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-gray-500">Không có tài khoản nào.</div>
      ) : (
        <table className="min-w-full bg-white shadow text-sm rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Người giới thiệu</th>
              <th className="px-3 py-2">Số dư</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="border-b">
                <td className="px-3 py-2">{acc.id}</td>
                <td className="px-3 py-2">{acc.username}</td>
                <td className="px-3 py-2">{acc.email}</td>
                <td className="px-3 py-2">{acc.phone}</td>
                <td className="px-3 py-2">{acc.affiliated_by}</td>
                <td className="px-3 py-2">
                  {acc.wallet?.currency
                    ? `${Number(acc.wallet?.balance || 0).toLocaleString()} ${
                        acc.wallet.currency
                      }`
                    : "0 VND"}
                </td>
                <td className="px-3 py-2">
                  {acc.status === 1 ? "Hoạt động" : "Bị khóa"}
                </td>
                <td className="px-3 py-2 space-x-2 text-center">
                  <button
                    className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-white"
                    onClick={() => navigate(`/admin/users/${acc.id}`)}
                  >
                    Chi tiết
                  </button>
                  {acc.status === 1 ? (
                    <button
                      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                      onClick={() => handleToggleStatus(acc.id, acc.status)}
                    >
                      Xóa
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 text-white"
                      onClick={() => handleToggleStatus(acc.id, acc.status)}
                    >
                      Khôi phục
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AccountListPage;
