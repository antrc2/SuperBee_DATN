// components/Pagination.jsx
import React from "react";

const Pagination = ({ meta, onPageChange }) => {
  // Ensure meta and its properties exist before accessing them
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const totalItems = meta?.total || 0;

  const pageNumbers = [];
  // Display a maximum number of pages to avoid being too long
  // Example: display 2 pages before, current page, 2 pages after
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);

  // Adjust startPage if endPage is limited by lastPage
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Base button styles for reusability
  const baseButtonClasses =
    "px-4 py-2 mx-1 rounded-md transition-colors duration-200";
  const enabledButtonClasses =
    "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";
  const disabledButtonClasses = "bg-gray-300 text-gray-600 cursor-not-allowed";
  const pageButtonClasses =
    "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50";
  const currentPageButtonClasses = "bg-blue-600 text-white font-bold";

  return (
    <nav className="flex justify-center items-center py-4">
      <ul className="flex items-center space-x-1">
        <li>
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`${baseButtonClasses} ${
              currentPage === 1 ? disabledButtonClasses : enabledButtonClasses
            }`}
          >
            First
          </button>
        </li>
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${baseButtonClasses} ${
              currentPage === 1 ? disabledButtonClasses : enabledButtonClasses
            }`}
          >
            Prev
          </button>
        </li>
        {startPage > 1 && (
          <li>
            <span className="px-4 py-2 mx-1 text-gray-700">...</span>
          </li>
        )}{" "}
        {/* Ellipsis if pages are hidden before */}
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`${baseButtonClasses} ${
                currentPage === number
                  ? currentPageButtonClasses
                  : pageButtonClasses
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        {endPage < lastPage && (
          <li>
            <span className="px-4 py-2 mx-1 text-gray-700">...</span>
          </li>
        )}{" "}
        {/* Ellipsis if pages are hidden after */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className={`${baseButtonClasses} ${
              currentPage === lastPage
                ? disabledButtonClasses
                : enabledButtonClasses
            }`}
          >
            Next
          </button>
        </li>
        <li>
          <button
            onClick={() => onPageChange(lastPage)}
            disabled={currentPage === lastPage}
            className={`${baseButtonClasses} ${
              currentPage === lastPage
                ? disabledButtonClasses
                : enabledButtonClasses
            }`}
          >
            Last
          </button>
        </li>
        {totalItems !== undefined && (
          <li className="ml-4">
            <span className="text-sm-700 text-sm">Total: {totalItems}</span>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
