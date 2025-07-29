import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "../../../contexts/NotificationContext";
import Pagination from "../../../components/Pagination/Pagination";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Plus,
  Search,
  Tag,
  Calendar,
  BarChart,
  Trash2,
  Pencil,
  Undo2,
  ChevronsRight,
} from "lucide-react";

// Helper để định dạng ngày
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const StatusBadge = ({ status, endDate }) => {
  const now = new Date();
  const isExpired = new Date(endDate) < now;
  let text = "Không hoạt động";
  let colorClasses =
    "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";

  if (status === 1 && !isExpired) {
    text = "Hoạt động";
    colorClasses =
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  } else if (status === 1 && isExpired) {
    text = "Hết hạn";
    colorClasses =
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const DiscountCodePage = () => {
  const [promotions, setPromotions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [sort, setSort] = useState({ by: "created_at", direction: "desc" });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { pop, conFim } = useNotification();

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: debouncedSearchTerm,
        status: filters.status,
        sort_by: sort.by,
        sort_direction: sort.direction,
      };
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );

      const res = await api.get("/admin/discountcode", { params });
      setPromotions(res.data.data.data);
      setMeta(res.data.data);
    } catch (err) {
      pop("Lỗi khi tải danh sách mã giảm giá", "e");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, filters, sort, pop]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, filters]);

  const handleDelete = async (id) => {
    const ok = conFim("Bạn có chắc chắn muốn xoá mã giảm giá này không?");
    if (ok) {
      try {
        const res = await api.delete(`/admin/discountcode/${id}`);

        if (res.data?.data) {
          setPromotions((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, ...res.data.data } : item
            )
          );
          pop("Xóa thành công", "s");
        } else {
          // Xoá cứng: loại bỏ khỏi danh sách
          setPromotions((prev) => prev.filter((item) => item.id !== id));
          pop("Xóa thành công", "s");
        }
      } catch (err) {
        pop("Xoá thất bại!", "e");
      }
    }
  };
  const handleUpdate = async (id) => {
    try {
      const res = await api.patch(`/admin/discountcode/${id}`);
      setDiscountCodes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...res.data.data } : item
        )
      );
    } catch (err) {
      alert("Khôi phục thất bại!");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Quản lý Khuyến mãi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tạo và quản lý các mã giảm giá cho sản phẩm.
          </p>
        </div>
        <Link to="/admin/discountcode/new">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500">
            <Plus size={18} />
            Thêm mã mới
          </button>
        </Link>
      </header>

      {/* Filter and Action Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo mã code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
          <select
            onChange={(e) => {
              const [by, dir] = e.target.value.split(",");
              setSort({ by, direction: dir });
            }}
            defaultValue="created_at,desc"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="created_at,desc">Mới nhất</option>
            <option value="end_date,asc">Sắp hết hạn</option>
            <option value="discount_value,desc">Giảm giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Mã Code
              </th>
              <th scope="col" className="px-6 py-3">
                Giá trị
              </th>
              <th scope="col" className="px-6 py-3">
                Mức sử dụng
              </th>
              <th scope="col" className="px-6 py-3">
                Hiệu lực
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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4" colSpan="6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : promotions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-slate-500">
                  <Tag size={48} className="mx-auto mb-2" />
                  Không tìm thấy mã giảm giá nào.
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {promo.code}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                    {promo.discount_value}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BarChart size={16} className="text-slate-400" />
                      <span>
                        {promo.total_used} /{" "}
                        {promo.usage_limit === -1 ? "∞" : promo.usage_limit}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(promo.start_date)}</span>
                      <ChevronsRight size={14} />
                      <span>{formatDate(promo.end_date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={promo.status}
                      endDate={promo.end_date}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Link
                        to={`/admin/promotions/${promo.id}/edit`}
                        title="Chỉnh sửa"
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                      {promo.status === 1 ? (
                        <button
                          title="Vô hiệu hóa"
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          title="Khôi phục"
                          onClick={() => handleUpdate(promo.id)}
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-green-600 transition-colors"
                        >
                          <Undo2 size={16} />
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

      {!loading && meta && (
        <Pagination meta={meta} onPageChange={(newPage) => setPage(newPage)} />
      )}
    </div>
  );
};

export default DiscountCodePage;
