import { useState, useEffect, useCallback } from "react";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import Pagination from "@components/Pagination/Pagination";
import { useDebounce } from "@uidotdev/usehooks"; // A popular debounce hook
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  User,
  Lock,
  Unlock,
  Pencil,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
// Helper components for better structure
const RoleBadge = ({ roleName }) => {
  const roleStyles = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    "admin-super":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    reseller:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    partner: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    user: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
    "ke-toan":
      "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    "nv-ho-tro":
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    "nv-marketing":
      "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    "nv-kiem-duyet":
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        roleStyles[roleName] || roleStyles["user"]
      }`}
    >
      {roleName?.replace(/-/g, " ") || "Không rõ"}
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      status === 1
        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    }`}
  >
    {status === 1 ? "Hoạt động" : "Bị khóa"}
  </span>
);

const AccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ role_id: "", status: "" });
  const [sort, setSort] = useState({ by: "created_at", direction: "desc" });
  const { user } = useAuth();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { pop, conFim } = useNotification();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: debouncedSearchTerm,
        role_id: filters.role_id,
        status: filters.status,
        sort_by: sort.by,
        sort_direction: sort.direction,
      };

      // Remove empty params
      Object.keys(params).forEach(
        (key) =>
          (params[key] === "" || params[key] === null) && delete params[key]
      );

      const res = await api.get("/admin/accounts", { params });
      setAccounts(res.data.data.users.data);
      setMeta(res.data.data.users);
      // Fetch roles only once
      if (roles.length === 0) {
        setRoles(res.data.data.roles);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách:", err);
      pop("Lỗi khi tải danh sách tài khoản", "e");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, filters, sort, pop, roles.length]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, filters]);

  const handleToggleStatus = async (id, status) => {
    const check = id == user?.id;
    if (check) {
      pop("Bạn không thể khóa tài khoản của mình", "e");
      return;
    }

    try {
      if (status === 1) {
        const check2 = await conFim("Ban có muốn khóa tài khoản này lại");
        if (!check2) return;
        setLoading(true);
        const res = await api.delete(`/admin/accounts/${id}`);
        setLoading(false);
        if (res.data.status) {
          pop("Khóa tài khoản thành công", "s");
        } else {
          pop("Khóa tài khoản không thành công", "e");
          return;
        }
      } else {
        const check2 = await conFim("Ban có muốn khôi phục tài khoản này lại");
        if (!check2) return;
        setLoading(true);
        const res = await api.patch(`/admin/accounts/${id}`);
        setLoading(false);
        if (res.data.status) {
          pop("Khôi phục tài khoản thành công", "s");
        } else {
          pop("Khôi phục tài khoản không thành công", "e");
          return;
        }
      }
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, status: status === 1 ? 0 : 1 } : acc
        )
      );
    } catch (err) {
      pop("Thao tác thất bại", "e");
      console.error(err);
    }
  };
  const handleEdit = (id) => {
    return navigate(`/admin/users/${id}`);
  };
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSortChange = (e) => {
    const [by, direction] = e.target.value.split(",");
    setSort({ by, direction });
  };
  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Quản lý tài khoản
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tìm kiếm, lọc và quản lý tất cả người dùng trong hệ thống.
        </p>
      </header>

      {/* Filter and Action Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative sm:col-span-2 md:col-span-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Filter by Role */}
          <select
            name="role_id"
            value={filters.role_id}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.description || role.name}
              </option>
            ))}
          </select>
          {/* Filter by Status */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="2">Bị khóa</option>
            <option value="0">Chưa kích hoạt</option>
          </select>
          {/* Sort */}
          <select
            onChange={handleSortChange}
            defaultValue="created_at,desc"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="created_at,desc">Mới nhất</option>
            <option value="username,asc">Tên A-Z</option>
            <option value="username,desc">Tên Z-A</option>
            <option value="balance,desc">Số dư: Cao đến thấp</option>
            <option value="balance,asc">Số dư: Thấp đến cao</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Tài khoản
              </th>
              <th scope="col" className="px-6 py-3">
                Vai trò
              </th>
              <th scope="col" className="px-6 py-3">
                Số dư
              </th>
              <th scope="col" className="px-6 py-3">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4" colSpan="5">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-500">
                  <User size={48} className="mx-auto mb-2" />
                  Không tìm thấy tài khoản nào.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {acc.username}
                    </div>
                    <div className="text-xs text-slate-500">{acc.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {acc.roles.map((role) => (
                        <RoleBadge key={role.id} roleName={role.name} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-700 dark:text-slate-200">
                      {Number(acc.wallet?.balance || 0).toLocaleString()} VND
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={acc.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        title="Chỉnh sửa"
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors"
                        onClick={() => handleEdit(acc.id)}
                      >
                        <Pencil size={16} />
                      </button>
                      {acc.status === 1 ? (
                        <button
                          title="Khóa"
                          onClick={() => handleToggleStatus(acc.id, acc.status)}
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Lock size={16} />
                        </button>
                      ) : (
                        <button
                          title="Mở khóa"
                          onClick={() => handleToggleStatus(acc.id, acc.status)}
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-green-600 transition-colors"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && meta && (
        <Pagination meta={meta} onPageChange={(newPage) => setPage(newPage)} />
      )}
    </div>
  );
};

export default AccountListPage;
