// components/Admin/Layout/Layout.jsx
import React, { useState } from "react";
import Pagination from "../../Pagination/Pagination";
import FilterModal from "./FilterModal";
import { Plus, Filter, Search, ChevronLeft } from "lucide-react";

const Layout = ({
  title,
  children,
  showBackButton = true,
  showAddButton = false,
  showBrowse = false,
  onBack,
  onAdd,
  onLocalSearch,
  initialSearchTermLocal,
  paginationMeta,
  onPageChange,
  onApplyFilters,
  onResetFilters,
  activeFilterCount,
  initialFilters,
  filterConfig,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {showAddButton
                ? "Thêm, xem, và quản lý các sản phẩm của bạn."
                : "Xem thông tin chi tiết về sản phẩm."}
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            {showBackButton && (
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Quay lại</span>
              </button>
            )}
            {showAddButton && (
              <button
                onClick={onAdd}
                className="flex w-full sm:w-auto items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Thêm mới</span>
              </button>
            )}
          </div>
        </header>

        {/* Filter & Search Bar */}
        {onLocalSearch && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo SKU..."
                  value={initialSearchTermLocal}
                  onChange={(e) => onLocalSearch(e.target.value)}
                  className="w-full pl-10 p-2 text-sm text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              {onApplyFilters && (
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="relative flex-shrink-0 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
                >
                  <Filter size={16} />
                  <span>Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-800">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}
            </div>
            {isFilterModalOpen && (
              <div className="mt-4">
                <FilterModal
                  isOpen={isFilterModalOpen}
                  onClose={() => setIsFilterModalOpen(false)}
                  onApplyFilters={onApplyFilters}
                  onResetFilters={onResetFilters}
                  initialFilters={initialFilters}
                  filterConfig={filterConfig}
                />
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          {children}
        </div>

        {/* Pagination */}
        {paginationMeta && paginationMeta.last_page > 1 && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border dark:border-gray-700 py-3 px-4">
            <Pagination meta={paginationMeta} onPageChange={onPageChange} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
