// components/Admin/FilterModal/FilterModal.jsx

import React, { useState, useEffect } from "react";
import { X, RotateCcw, Check } from "lucide-react";

const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  initialFilters,
  filterConfig,
}) => {
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters, isOpen]);

  const handleChange = (name, value) => {
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (name, type, value) => {
    const key = `${name}_${type}`;
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(localFilters).filter(
        ([_, value]) => value !== "" && value !== undefined && value !== null
      )
    );
    onApplyFilters(cleanedFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mb-5">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out origin-top-right animate-slide-down border dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Bộ lọc nâng cao
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {filterConfig.map((filter) => (
            <div key={filter.name} className="flex flex-col">
              <label
                htmlFor={filter.name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                {filter.label}
              </label>
              {filter.type === "text" && (
                <input
                  type="text"
                  id={filter.name}
                  name={filter.name}
                  placeholder={filter.placeholder}
                  value={localFilters[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                />
              )}
              {filter.type === "number_range" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    name={filter.minName}
                    placeholder={filter.placeholderMin}
                    value={localFilters[filter.minName] || ""}
                    onChange={(e) =>
                      handleRangeChange(filter.name, "min", e.target.value)
                    }
                    className="w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                  <input
                    type="number"
                    name={filter.maxName}
                    placeholder={filter.placeholderMax}
                    value={localFilters[filter.maxName] || ""}
                    onChange={(e) =>
                      handleRangeChange(filter.name, "max", e.target.value)
                    }
                    className="w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                </div>
              )}
              {filter.type === "select" && (
                <select
                  id={filter.name}
                  name={filter.name}
                  value={localFilters[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
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
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t dark:border-gray-700 pt-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <Check size={18} />
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
