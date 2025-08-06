import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Plus,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../../../components/Pagination/Pagination";

// Component StatusBadge
const StatusBadge = ({ status }) => {
  const style =
    status === 1
      ? {
          text: "Hiển thị",
          classes:
            "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
        }
      : {
          text: "Ẩn",
          classes:
            "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
        };
  return (
    <span
      className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.classes}`}
    >
      {style.text}
    </span>
  );
};

// Component Card cho mỗi Banner
const BannerCard = ({ banner, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-slate-200 dark:bg-slate-700">
      <img
        src={banner.image_url}
        alt={banner.title || "Banner"}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <StatusBadge status={banner.status} />

      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="font-bold">{banner.title || "Không có tiêu đề"}</h3>
        <a
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-300 hover:underline truncate"
        >
          {banner.link}
        </a>
      </div>

      {/* Action Menu */}
      <div ref={menuRef} className="absolute top-2 left-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 py-1">
            <Link
              to={`/admin/banners/${banner.id}/edit`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Pencil size={14} /> Chỉnh sửa
            </Link>
            <button
              onClick={() => {
                onDelete(banner.id);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Trash2 size={14} /> Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component Skeleton cho BannerCard
const BannerCardSkeleton = () => (
  <div className="animate-pulse aspect-video w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
);

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
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
    status: queryParams.get("status") || "",
    start_date: queryParams.get("start_date") || "",
    end_date: queryParams.get("end_date") || "",
  });
  const debouncedFilters = useDebounce(filters, 500);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/banners${location.search}`);
      setBanners(response.data.data.data);
      setMeta(response.data.data);
    } catch (error) {
      pop("Lỗi khi tải danh sách banner", "e");
    } finally {
      setLoading(false);
    }
  }, [location.search, pop]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.keys(debouncedFilters).forEach((key) => {
      if (debouncedFilters[key]) params.set(key, debouncedFilters[key]);
    });
    navigate({ search: params.toString() });
  }, [debouncedFilters, navigate]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleDelete = async (id) => {
    const confirmed = await conFim("Bạn có chắc chắn muốn xóa banner này?");
    if (confirmed) {
      try {
        await api.delete(`/admin/banners/${id}`);
        pop("Xóa banner thành công", "s");
        fetchBanners();
      } catch (err) {
        pop("Xóa banner thất bại", "e");
      }
    }
  };

  // Các hàm xử lý filter tương tự trang Order
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ status: "", start_date: "", end_date: "" });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Quản lý Banner
          </h1>
        </div>
        <Link to="/admin/banners/new">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            <Plus size={18} /> Thêm banner
          </button>
        </Link>
      </header>

      {/* Filter Bar */}
      <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hiển thị</option>
            <option value="0">Ẩn</option>
          </select>
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
          <DatePicker
            selected={filters.end_date ? new Date(filters.end_date) : null}
            onChange={(date) =>
              handleFilterChange(
                "end_date",
                date?.toISOString().split("T")[0] || ""
              )
            }
            placeholderText="Đến ngày"
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

      {/* Banners Grid */}
      <main>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <BannerCardSkeleton key={i} />
            ))}
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <ImageIcon size={48} className="mx-auto mb-2" />
            Không tìm thấy banner nào.
          </div>
        )}
      </main>

      {!loading && meta && (
        <Pagination
          meta={meta}
          onPageChange={(page) => navigate({ search: `?page=${page}` })}
        />
      )}
    </div>
  );
}
