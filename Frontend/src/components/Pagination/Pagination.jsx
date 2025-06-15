// components/Pagination.jsx
import React from "react";

export default function Pagination({ meta, onPageChange }) {
  const { current_page, last_page } = meta;

  const handlePageClick = (page) => {
    if (page !== current_page && page >= 1 && page <= last_page) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex gap-2 mt-4 justify-center items-center">
      <button
        disabled={current_page === 1}
        onClick={() => handlePageClick(current_page - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ← Trước
      </button>

      {[...Array(last_page)].map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`px-3 py-1 rounded ${
              current_page === page ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        disabled={current_page === last_page}
        onClick={() => handlePageClick(current_page + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Sau →
      </button>
    </div>
  );
}
