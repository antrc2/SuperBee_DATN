// @pages/Admin/Products/TrangDanhSachAccGame.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Components con vẫn sử dụng
import ProductsListPage from "./ProductsListPage";
import Pagination from "../../../components/Pagination/Pagination";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

// Utils và Contexts
import api from "../../../utils/http";
import { useNotification } from "../../../contexts/NotificationContext";

// Icons
import { Plus, Search, RotateCcw, Check } from "lucide-react";

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// ===================================================================
// START OF THE SINGLE COMBINED COMPONENT
// ===================================================================
const TrangDanhSachAccGame = () => {
  // --- STATES AND HOOKS ---
  const { pop, conFim } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // State for data
  const [products, setProducts] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for the entire filter configuration
  const [filterConfig, setFilterConfig] = useState(null);

  // Parse filters from URL
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialFiltersFromUrl = useMemo(() => {
    const currentFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page") {
        currentFilters[key] = value;
      }
    }
    return currentFilters;
  }, [searchParams]);

  // State for local filter inputs
  const [localFilters, setLocalFilters] = useState(initialFiltersFromUrl);

  // State for Server-Side Search
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- API CALLS AND DATA FETCHING ---

  // Fetch product list based on URL params
  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/products", {
        params: searchParams,
      });
      const { data, ...meta } = response.data.data;
      setProducts(data);
      setPaginationMeta(meta);
    } catch (error) {
      pop("Lấy dữ liệu thất bại", "e");
    } finally {
      setLoading(false);
    }
  }, [location.search, pop]); // Re-run when location.search changes

  // --- EFFECTS ---

  // Effect to fetch categories and build the DYNAMIC filter config
  useEffect(() => {
    const buildFilterConfig = async () => {
      try {
        // 1. Gọi API để lấy danh mục động
        const response = await api.get("/categories");
        const categoryOptions = response.data.data.onlyChildren.map((cat) => ({
          label: cat.name,
          value: cat.id.toString(),
        }));

        const dynamicCategoryFilter = {
          type: "select",
          name: "category_id",
          label: "Danh mục",

          options: [{ label: "Tất cả", value: "" }, ...categoryOptions],
        };

        // 2. Tự quy ước cấu hình cho Trạng thái
        const statusFilter = {
          type: "select",
          name: "status",
          label: "Trạng thái",
          options: [
            { label: "Tất cả", value: "" },
            { label: "Đang bán", value: "1" },
            { label: "Không bán", value: "3" },
            { label: "Bán thành công", value: "4" },
            { label: "Bị từ chối", value: "0" },
          ],
        };

        // 3. Tự quy ước cấu hình cho Khoảng giá
        const priceFilter = {
          type: "number_range",
          name: "price",
          label: "Khoảng giá",
          minName: "price_min",
          maxName: "price_max",
          placeholderMin: "Giá từ",
          placeholderMax: "Giá đến",
        };

        // 4. Gộp tất cả lại và set vào state
        setFilterConfig([dynamicCategoryFilter, statusFilter, priceFilter]);
      } catch (error) {
        pop("Không thể tải cấu hình bộ lọc", "e");
        // Fallback với bộ lọc cơ bản nếu API lỗi
        setFilterConfig([
          {
            type: "select",
            name: "status",
            label: "Trạng thái",
            options: [{ label: "Tất cả", value: "" }],
          },
          {
            type: "number_range",
            name: "price",
            label: "Khoảng giá",
            minName: "price_min",
            maxName: "price_max",
            placeholderMin: "Giá từ",
            placeholderMax: "Giá đến",
          },
        ]);
      }
    };

    buildFilterConfig();
  }, [pop]);

  // Main effect to fetch products when component mounts or URL changes
  useEffect(() => {
    getProducts();
  }, [getProducts]);

  // Effect for handling debounced search -> updates URL
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearchTerm !== currentSearch) {
      if (debouncedSearchTerm) {
        searchParams.set("search", debouncedSearchTerm);
      } else {
        searchParams.delete("search");
      }
      searchParams.set("page", "1");
      navigate({ search: searchParams.toString() });
    }
  }, [debouncedSearchTerm, searchParams, navigate]);

  // Effect to sync local filter state with URL
  useEffect(() => {
    setLocalFilters(initialFiltersFromUrl);
  }, [initialFiltersFromUrl]);

  // --- EVENT HANDLERS ---

  // Handlers for local filter inputs
  const handleFilterInputChange = (name, value) => {
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterRangeChange = (name, type, value) => {
    const truncatedValue = value.slice(0, 15);
    const key = `${name}_${type}`;
    setLocalFilters((prev) => ({ ...prev, [key]: truncatedValue }));
  };

  // Handler to apply filters -> updates URL
  const handleApplyFilters = () => {
    // ========== VALIDATE GIÁ TỪ < GIÁ ĐẾN ==========
    const { price_min, price_max } = localFilters;
    if (price_min && price_max) {
      const priceMin = parseFloat(price_min);
      const priceMax = parseFloat(price_max);

      if (priceMin >= priceMax) {
        pop("Giá trị 'Giá từ' phải nhỏ hơn 'Giá đến'.", "e");
        return; // Dừng hàm tại đây nếu validate thất bại
      }
    }
    // ================================================

    Object.keys(localFilters).forEach((key) => {
      if (localFilters[key]) {
        searchParams.set(key, localFilters[key]);
      } else {
        searchParams.delete(key);
      }
    });
    if (searchTerm) {
      searchParams.set("search", searchTerm);
    }
    searchParams.set("page", "1");
    navigate({ search: searchParams.toString() });
  };

  // Handler to reset filters -> updates URL
  const handleResetFilters = () => {
    const newParams = new URLSearchParams();
    if (searchTerm) {
      newParams.set("search", searchTerm);
    }
    navigate({ search: newParams.toString() });
  };

  // Handler for pagination -> updates URL
  const handlePageChange = (page) => {
    searchParams.set("page", page);
    navigate({ search: searchParams.toString() });
  };

  // Handlers for product actions
  const handleAddAccount = () => navigate("/admin/products/new");
  const handleAction = async (actionType, id, confirmMessage) => {
    const ok = await conFim(confirmMessage);
    if (ok) {
      try {
        const url = `/admin/products/${id}/${actionType}`;
        await api.post(url);
        pop(
          `${
            actionType === "restore" ? "Kích hoạt" : "Khóa"
          } sản phẩm thành công`,
          "s"
        );
        getProducts();
      } catch (err) {
        pop(
          `Thực hiện thất bại: ${err?.response?.data?.message || err.message}`,
          "e"
        );
      }
    }
  };

  // --- RENDER LOGIC ---

  if (loading || !filterConfig) {
    return <LoadingDomain />;
  }

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Danh sách tài khoản game
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Thêm, xem, và quản lý các sản phẩm của bạn.
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <button
              onClick={handleAddAccount}
              className="flex w-full sm:w-auto items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Thêm mới</span>
            </button>
          </div>
        </header>

        {/* Search & Filter Panel */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 text-sm text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Filters Section */}
          <div className="mt-4 border-t dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filterConfig.map((filter) => (
                <div key={filter.name} className="flex flex-col">
                  <label
                    htmlFor={filter.name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {filter.label}
                  </label>
                  {filter.type === "number_range" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name={filter.minName}
                        placeholder={filter.placeholderMin}
                        value={localFilters[filter.minName] || ""}
                        onChange={(e) =>
                          handleFilterRangeChange(
                            filter.name,
                            "min",
                            e.target.value
                          )
                        }
                        max="999999999999999"
                        min="0"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        name={filter.maxName}
                        placeholder={filter.placeholderMax}
                        value={localFilters[filter.maxName] || ""}
                        onChange={(e) =>
                          handleFilterRangeChange(
                            filter.name,
                            "max",
                            e.target.value
                          )
                        }
                        max="999999999999999"
                        min="0"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                      />
                    </div>
                  ) : (
                    <select
                      id={filter.name}
                      name={filter.name}
                      value={localFilters[filter.name] || ""}
                      onChange={(e) =>
                        handleFilterInputChange(filter.name, e.target.value)
                      }
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                    >
                    
                      {filter.options.map((option, optIndex) => (
                        <option
                          key={optIndex}
                          value={option.value}
                          className="dark:bg-gray-700 dark:text-gray-200"
                        >
                          {option.label}
                        </option>
                      ))}
                      <option value="1">Khác</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Check size={18} /> Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          <ProductsListPage
            products={products}
            handleKey={(id) =>
              handleAction("restore", id, "Kích hoạt lại sản phẩm này?")
            }
            handleLock={(id) =>
              handleAction("cancel", id, "Khóa sản phẩm này?")
            }
          />
        </div>

        {/* Pagination Section */}
        {paginationMeta && paginationMeta.last_page > 1 && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border dark:border-gray-700 py-3 px-4">
            <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
          </div>
        )}
      </main>
    </div>
  );
};

export default TrangDanhSachAccGame;
