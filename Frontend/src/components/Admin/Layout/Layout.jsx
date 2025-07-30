// components/Admin/Layout/Layout.jsx

import React, { useState } from "react";
import Pagination from "../../Pagination/Pagination";
import FilterModal from "./FilterModal";
import { Plus, Filter, Search, ChevronLeft, Sun, Moon } from "lucide-react";

const Layout = ({
  title,
  children,
  showBackButton = true,
  showAddButton = false,
  showBrowse = false,
  onBack,
  onAdd,
  onshow,
  onApprove,
  onLocalSearch,
  initialSearchTermLocal,
  paginationMeta,
  onPageChange,
  onApplyFilters,
  onResetFilters,
  activeFilterCount,
  initialFilters,
  filterConfig,
  autoPostButtonLabel,
  showfilter = true,
  showAuToPost = false,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className=" items-center gap-2">
            {showBackButton && (
              <button
                onClick={onBack}
                className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium p-2 rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline ml-1">Quay lại</span>
              </button>
            )}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                {title}
              </h1>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Tạo và quản lý các mã giảm giá cho sản phẩm.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Local Search */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search
                  className="text-gray-400 dark:text-gray-500"
                  size={18}
                />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={initialSearchTermLocal}
                onChange={(e) => onLocalSearch(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 transition"
              />
            </div>

            {/* Filter Button */}
            {showfilter && (
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="relative flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-3 rounded-md transition-colors"
              >
                <Filter size={18} />
                <span className="hidden sm:inline ml-2">Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {/* Add Button */}
            {showAddButton && (
              <button
                onClick={onAdd}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline ml-2">Thêm mới</span>
              </button>
            )}

            {showAuToPost && (
              <button
                onClick={onshow}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out"
              >
                <Plus className="mr-2 inline-block" size={18} />
                {autoPostButtonLabel || "Bật tự động đăng bài"}
              </button>
            )}

            {showBrowse && (
              <button
                onClick={onApprove}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out"
              >
                Duyệt SP
              </button>
            )}
          </div>
        </div>

        {/* Search bar for mobile */}
        <div className="relative mt-4 md:hidden">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={initialSearchTermLocal}
            onChange={(e) => onLocalSearch(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 transition"
          />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {isFilterModalOpen && (
          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
            initialFilters={initialFilters}
            filterConfig={filterConfig}
          />
        )}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">{children}</div>
        </div>
        {paginationMeta && paginationMeta.last_page > 1 && (
          <div className="mt-4 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="py-3 px-4 sm:px-6">
              <Pagination meta={paginationMeta} onPageChange={onPageChange} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
