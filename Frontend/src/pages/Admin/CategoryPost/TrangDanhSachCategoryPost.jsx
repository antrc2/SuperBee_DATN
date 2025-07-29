import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import { useDebounce } from "@uidotdev/usehooks";
import { Plus, Search, FileText, Pencil, Trash2, XCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../../../components/Pagination/Pagination";
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN");

export default function CategoryPostListPage() {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pop, conFim } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const [filters, setFilters] = useState({
    search: queryParams.get("search") || "",
    start_date: queryParams.get("start_date") || "",
    end_date: queryParams.get("end_date") || "",
  });
  const debouncedFilters = useDebounce(filters, 500);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/categoryPost${location.search}`);
      setCategories(response.data.data.data);
      setMeta(response.data.data);
    } catch (error) {
      pop("Lỗi khi tải danh mục bài viết", "e");
    } finally {
      setLoading(false);
    }
  }, [location.search, pop]);

  // Đồng bộ URL với state filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.keys(debouncedFilters).forEach((key) => {
      if (debouncedFilters[key]) params.set(key, debouncedFilters[key]);
    });
    navigate({ search: params.toString() }, { replace: true });
  }, [debouncedFilters, navigate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (slug) => {
    const confirmed = await conFim("Bạn có chắc chắn muốn xóa danh mục này?");
    if (confirmed) {
      try {
        await api.delete(`/admin/categoryPost/${slug}`);
        pop("Xóa danh mục thành công", "s");
        fetchCategories(); // Tải lại dữ liệu
      } catch (err) {
        pop("Xóa danh mục thất bại.", "e");
      }
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    // Khi thay đổi filter, nên reset về trang 1
    const params = new URLSearchParams(location.search);
    params.set("page", "1");
    setFilters(newFilters);
    navigate({ search: params.toString() });
  };

  const resetFilters = () =>
    setFilters({ search: "", start_date: "", end_date: "" });
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Danh mục Bài viết
          </h1>
        </div>
        <Link to="/admin/categoryPost/new">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            <Plus size={18} /> Thêm danh mục
          </button>
        </Link>
      </header>

      {/* Filter Bar */}
      <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, mô tả..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <DatePicker
            selected={filters.start_date ? new Date(filters.start_date) : null}
            onChange={(date) =>
              handleFilterChange(
                "start_date",
                date?.toISOString().split("T")[0] || ""
              )
            }
            placeholderText="Từ ngày"
            isClearable
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={resetFilters}
            className="relative flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <XCircle size={16} /> Xóa bộ lọc
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3">Tên danh mục</th>
              <th className="px-6 py-3">Mô tả</th>
              <th className="px-6 py-3">Ngày tạo</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="p-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4">{cat.description}</td>
                  <td className="px-6 py-4">{formatDate(cat.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center space-x-2">
                      <Link
                        to={`/admin/categoryPost/${cat.slug}/edit`}
                        title="Chỉnh sửa"
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(cat.slug)}
                        title="Xóa"
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-16 text-slate-500">
                  <FileText size={48} className="mx-auto mb-2" />
                  Không có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && meta && (
        <Pagination
          meta={meta}
          onPageChange={(page) => navigate({ search: `?page=${page}` })}
        />
      )}
    </div>
  );
}
