// components/Admin/Layout/Layout.jsx

import React, { useState } from "react";
import Pagination from "../../Pagination/Pagination";
import FilterModal from "./FilterModal";
// Thay đổi: import icon từ lucide-react
import { Plus, Filter, Search, ChevronLeft } from "lucide-react";

const Layout = ({
  title,
  children,
  showBackButton = true,
  showAddButton = false,
  showBrowse = false,
  onBack,
  onAdd,
  onApprove, // Giả sử bạn có hàm này để duyệt sản phẩm  
  onLocalSearch,
  initialSearchTermLocal,
  paginationMeta,
  onPageChange,
  onApplyFilters,
  onResetFilters,
  activeFilterCount,
  initialFilters,
  filterConfig,
  showfilter = true,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex-grow flex flex-col">
        <div className="p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {/* Thay đổi: Sử dụng icon <ChevronLeft /> */}
                  <ChevronLeft size={18} />
                  Quay lại
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Thay đổi: Sử dụng icon <Search /> */}
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh (FE)..."
                  value={initialSearchTermLocal}
                  onChange={(e) => onLocalSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              {showfilter && (

              <div className="relative">
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {/* Thay đổi: Sử dụng icon <Filter /> */}
                  <Filter size={16} />
                  <span>Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
              )
              }

              {showAddButton && (
              
                <button
                  onClick={onAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {/* Thay đổi: Sử dụng icon <Plus /> */}
                  <Plus size={18} />
                  Thêm mới
                </button>

               
              )}
              {showBrowse && (
                
                
                <button
                  onClick={onApprove}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Duyệt SP
                </button>
             
              )}
            </div>
          </div>
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
          <div className="flex-grow bg-white p-6 rounded-lg shadow-sm">
            {children}
          </div>

          {paginationMeta && paginationMeta.last_page > 1 && (
            <div className="mt-6 flex justify-end">
              <Pagination meta={paginationMeta} onPageChange={onPageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
