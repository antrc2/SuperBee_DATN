import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) {
    return null; // Don't render if there's only one page or no data
  }

  const { current_page, last_page, from, to, total } = meta;

  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(last_page, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const buttonClasses =
    "flex items-center justify-center h-9 w-9 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50";
  const enabledClasses =
    "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700";
  const disabledClasses =
    "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed";
  const currentClasses =
    "bg-indigo-600 text-white font-bold pointer-events-none";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-2">
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-0">
        Hiển thị từ **{from}** đến **{to}** trong tổng số **{total}** mục
      </div>
      <nav>
        <ul className="flex items-center space-x-1.5">
          <li>
            <button
              onClick={() => onPageChange(1)}
              disabled={current_page === 1}
              className={`${buttonClasses} ${
                current_page === 1 ? disabledClasses : enabledClasses
              }`}
              aria-label="First Page"
            >
              <ChevronsLeft size={18} />
            </button>
          </li>
          <li>
            <button
              onClick={() => onPageChange(current_page - 1)}
              disabled={current_page === 1}
              className={`${buttonClasses} ${
                current_page === 1 ? disabledClasses : enabledClasses
              }`}
              aria-label="Previous Page"
            >
              <ChevronLeft size={20} />
            </button>
          </li>

          {startPage > 1 && (
            <li>
              <span className="flex items-center justify-center h-9 w-9 text-slate-500">
                ...
              </span>
            </li>
          )}

          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => onPageChange(number)}
                className={`${buttonClasses} ${
                  current_page === number ? currentClasses : enabledClasses
                }`}
              >
                {number}
              </button>
            </li>
          ))}

          {endPage < last_page && (
            <li>
              <span className="flex items-center justify-center h-9 w-9 text-slate-500">
                ...
              </span>
            </li>
          )}

          <li>
            <button
              onClick={() => onPageChange(current_page + 1)}
              disabled={current_page === last_page}
              className={`${buttonClasses} ${
                current_page === last_page ? disabledClasses : enabledClasses
              }`}
              aria-label="Next Page"
            >
              <ChevronRight size={20} />
            </button>
          </li>
          <li>
            <button
              onClick={() => onPageChange(last_page)}
              disabled={current_page === last_page}
              className={`${buttonClasses} ${
                current_page === last_page ? disabledClasses : enabledClasses
              }`}
              aria-label="Last Page"
            >
              <ChevronsRight size={18} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
