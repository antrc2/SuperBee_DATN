// src/pages/Admin/Account/AccountListPage.jsx
import { useState } from "react";

const mockAccounts = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    phone: "0123456789",
    role_id: 1,
    web_id: 1,
    affiliated_by: "ref1",
    status: 1,
    created_at: "2024-01-01",
    updated_at: "2024-05-01",
  },
  {
    id: 2,
    username: "agent2",
    email: "agent2@example.com",
    phone: "0987654321",
    role_id: 2,
    web_id: 1,
    affiliated_by: "ref2",
    status: 0,
    created_at: "2024-02-01",
    updated_at: "2024-05-01",
  },
];

const roles = {
  1: "Người dùng",
  2: "Cộng tác viên",
  3: "Đại lý",
};

const AccountListPage = () => {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [filterRole, setFilterRole] = useState(0);

  const handleToggleStatus = (id) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, status: acc.status === 1 ? 0 : 1 } : acc
      )
    );
  };

  const filteredAccounts =
    filterRole === 0
      ? accounts
      : accounts.filter((acc) => acc.role_id === filterRole);

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
          <option value={1}>Người dùng</option>
          <option value={2}>Cộng tác viên</option>
          <option value={3}>Đại lý</option>
        </select>
      </div>

      <table className="min-w-full bg-white shadow text-sm rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Username</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Web ID</th>
            <th className="px-3 py-2">Người giới thiệu</th>
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
              <td className="px-3 py-2">{roles[acc.role_id]}</td>
              <td className="px-3 py-2">{acc.web_id}</td>
              <td className="px-3 py-2">{acc.affiliated_by}</td>
              <td className="px-3 py-2">
                {acc.status === 1 ? "Hoạt động" : "Bị khóa"}
              </td>
              <td className="px-3 py-2 space-x-2 text-center">
                <button className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white">
                  Sửa
                </button>
                <button
                  className={`px-3 py-1 rounded text-white ${
                    acc.status === 1 ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                  onClick={() => handleToggleStatus(acc.id)}
                >
                  {acc.status === 1 ? "Khóa" : "Mở khóa"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountListPage;
