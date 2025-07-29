import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import DonatePromotionPage from "./DonatePromotionPage";
import Pagination from "../../../components/Pagination/Pagination";
import { Plus, Search } from "lucide-react";

const DonatePromotionDashboard = () => {
  const { pop } = useNotification();
  const [allPromotions, setAllPromotions] = useState([]); // Lưu tất cả khuyến mãi của trang hiện tại
  const [loading, setLoading] = useState(true);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { conFim } = useNotification();
  // States for client-side filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [sort, setSort] = useState({ by: "id", direction: "desc" });

  const currentPage = useMemo(() => {
    return new URLSearchParams(location.search).get("page") || "1";
  }, [location.search]);

  const getPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/admin/donate_promotions?page=${currentPage}`
      );
      const { data, ...meta } = response.data.data;
      setAllPromotions(data);
      setPaginationMeta(meta);
    } catch (error) {
      pop("Lỗi khi tải khuyến mãi", "e");
      setAllPromotions([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pop]);

  useEffect(() => {
    getPromotions();
  }, [getPromotions]);

  // Logic lọc, sắp xếp và tìm kiếm ở client
  const displayedPromotions = useMemo(() => {
    let filteredData = [...allPromotions];

    // Filtering
    if (filters.status !== "") {
      filteredData = filteredData.filter(
        (p) => p.status.toString() === filters.status
      );
    }

    // Searching
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (p) =>
          p.id.toString().includes(term) || p.amount.toString().includes(term)
      );
    }

    // Sorting
    filteredData.sort((a, b) => {
      const valA = a[sort.by];
      const valB = b[sort.by];
      if (valA < valB) return sort.direction === "asc" ? -1 : 1;
      if (valA > valB) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filteredData;
  }, [allPromotions, searchTerm, filters, sort]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
  };

  const handleAction = async (actionType, id, confirmMessage) => {
    const ok = await conFim(confirmMessage);
    if (ok) {
      try {
        if (actionType === "undo") {
          await api.post(`/admin/donate_promotions/${id}/undo`);
        } else {
          await api.delete(`/admin/donate_promotions/${id}`);
        }
        getPromotions();
      } catch (err) {
        console.error("Lỗi khi thực hiện hành động:", err);
      }
    }
  };
  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Khuyến mãi Nạp thẻ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các chương trình khuyến mãi khi người dùng nạp tiền.
          </p>
        </div>
        <Link to="/admin/donatePromotions/new">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500">
            <Plus size={18} />
            Tạo khuyến mãi
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
              placeholder="Tìm theo ID, % khuyến mãi..."
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
            <option value="1">Hoạt động</option>
            <option value="0">Ngưng</option>
          </select>
          <select
            onChange={(e) => {
              const [by, dir] = e.target.value.split(",");
              setSort({ by, direction: dir });
            }}
            defaultValue="id,desc"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="id,desc">Mới nhất</option>
            <option value="end_date,asc">Sắp hết hạn</option>
            <option value="amount,desc">Khuyến mãi: Cao đến thấp</option>
            <option value="amount,asc">Khuyến mãi: Thấp đến cao</option>
          </select>
        </div>
      </div>

      {/* {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="animate-pulse">
            <td className="px-6 py-4" colSpan="6">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </td>
          </tr>
        ))
      ) : (
        <> */}
      <DonatePromotionPage
        loading={loading}
        data={displayedPromotions}
        searchTerm={searchTerm}
        handleLock={(id) => handleAction("lock", id, "Bạn muốn khóa")}
        handleUndo={(id) => handleAction("undo", id, "Mở khóa")}
      />
      <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
      {/* </> */}
      {/* // )} */}
    </div>
  );
};

export default DonatePromotionDashboard;
