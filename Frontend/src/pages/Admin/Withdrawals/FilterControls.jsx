import React from "react";
import { Search } from "lucide-react";

const FilterControls = ({ filters, setFilters, onExport }) => {
  // Component này không cần thay đổi logic
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-wrap items-center justify-between gap-4">
      <div className="relative flex-grow max-w-xs">
        <input
          type="text"
          name="search"
          placeholder="Tìm kiếm mã GD, tên, STK..."
          value={filters.search}
          onChange={handleFilterChange}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <div className="flex-grow max-w-xs">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="0">Chờ xử lý</option>
          <option value="1">Thành công</option>
          <option value="2">Đã hủy</option>
          <option value="3">Thất bại</option>
        </select>
      </div>
      <button
        onClick={onExport}
        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow"
      >
        Export (Chờ xử lý)
      </button>
    </div>
  );
};

export default FilterControls;
