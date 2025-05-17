export default function Pagination({ currentPage, totalPages, onPrev, onNext }) {
  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Trang trước
      </button>
      <span>
        {currentPage} / {totalPages || 1}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Trang sau
      </button>
    </div>
  );
}