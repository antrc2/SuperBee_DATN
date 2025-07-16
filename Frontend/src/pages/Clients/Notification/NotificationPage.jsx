import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import clsx from "clsx"; // clsx là một tiện ích nhỏ để nối các tên lớp lại với nhau có điều kiện
import NotificationItem from "../../../components/Client/Notification/NotificationItem";
import Breadcrumbs from "../../../utils/Breadcrumbs";
// Import file cấu hình
import { NOTIFICATION_TYPES } from "../../../config/notification.jsx";
import { useHome } from "../../../contexts/HomeContext.jsx";

const ITEMS_PER_PAGE = 5; // Số lượng thông báo trên mỗi trang

// --- COMPONENT PHÂN TRANG ---
// Component con để xử lý logic và giao diện của phân trang
const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  if (pageCount <= 1) {
    return null; // Không hiển thị phân trang nếu chỉ có 1 trang
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pageCount) {
      onPageChange(page);
    }
  };

  // Tạo ra danh sách các số trang để hiển thị
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số lượng nút trang tối đa hiển thị
    const ellipsis = (
      <span key="ellipsis" className="px-4 py-2 text-secondary">
        ...
      </span>
    );

    if (pageCount <= maxPagesToShow + 2) {
      for (let i = 1; i <= pageCount; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={clsx("px-4 py-2 rounded-lg text-sm w-auto", {
              "action-button-primary shadow-md": i === currentPage,
              "border-hover bg-input text-secondary": i !== currentPage,
            })}
          >
            {i}
          </button>
        );
      }
    } else {
      // Logic hiển thị phức tạp hơn: 1 ... 4 5 6 ... 10
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={clsx("px-4 py-2 rounded-lg text-sm w-auto", {
            "action-button-primary shadow-md": 1 === currentPage,
            "border-hover bg-input text-secondary": 1 !== currentPage,
          })}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pageNumbers.push(ellipsis);
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(pageCount - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={clsx("px-4 py-2 rounded-lg text-sm w-auto", {
              "action-button-primary shadow-md": i === currentPage,
              "border-hover bg-input text-secondary": i !== currentPage,
            })}
          >
            {i}
          </button>
        );
      }

      if (currentPage < pageCount - 2) {
        pageNumbers.push(ellipsis);
      }

      pageNumbers.push(
        <button
          key={pageCount}
          onClick={() => handlePageChange(pageCount)}
          className={clsx("px-4 py-2 rounded-lg text-sm w-auto", {
            "action-button-primary shadow-md": pageCount === currentPage,
            "border-hover bg-input text-secondary": pageCount !== currentPage,
          })}
        >
          {pageCount}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="mt-8 flex justify-center items-center space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border-hover bg-input text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trước
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageCount}
        className="px-4 py-2 rounded-lg border-hover bg-input text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sau
      </button>
    </div>
  );
};

// --- COMPONENT TRANG CHÍNH ---
const NotificationPage = () => {
  const { notifications } = useHome();

  // State cho các bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterReadStatus, setFilterReadStatus] = useState("all"); // State mới cho trạng thái đọc
  const [sortOrder, setSortOrder] = useState("newest");

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Sử dụng useMemo để tính toán danh sách thông báo đã được lọc và sắp xếp
  // Chỉ tính toán lại khi các bộ lọc hoặc dữ liệu gốc thay đổi
  const filteredNotifications = useMemo(() => {
    let result = [...(notifications?.notifications || [])];

    // 1. Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      result = result.filter((n) =>
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Lọc theo loại thông báo
    if (filterType !== "all") {
      result = result.filter((n) => n.type === filterType);
    }

    // 3. Lọc theo trạng thái đã đọc / chưa đọc
    if (filterReadStatus !== "all") {
      const isRead = filterReadStatus === "read";
      result = result.filter((n) => n.is_read === isRead);
    }

    // 4. Sắp xếp
    result.sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [searchTerm, filterType, sortOrder, notifications, filterReadStatus]);

  // Reset về trang 1 mỗi khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortOrder, filterReadStatus]);

  // Tính toán các thông báo sẽ hiển thị trên trang hiện tại và tổng số trang
  const pageCount = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const displayedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold font-heading">
            Trung tâm Thông báo
          </h1>
        </div>
        <Breadcrumbs />
      </div>

      {/* Filter Section */}
      <div className="section-bg mb-8 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-secondary mb-2"
            >
              Tìm kiếm thông báo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-secondary" />
              </span>
              <input
                type="search"
                id="search"
                placeholder="Nhập nội dung cần tìm..."
                className="w-full pl-10 pr-4 py-3 bg-input text-input border-hover rounded-lg placeholder-theme focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-semibold text-secondary mb-2"
            >
              Loại thông báo
            </label>
            <select
              id="type"
              className="w-full px-4 py-3 bg-input text-input border-hover rounded-lg focus:outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {Object.values(NOTIFICATION_TYPES)
                .filter((type) => type.showInFilter)
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Read Status Filter (MỚI) */}
          <div>
            <label
              htmlFor="readStatus"
              className="block text-sm font-semibold text-secondary mb-2"
            >
              Trạng thái
            </label>
            <select
              id="readStatus"
              className="w-full px-4 py-3 bg-input text-input border-hover rounded-lg focus:outline-none"
              value={filterReadStatus}
              onChange={(e) => setFilterReadStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-start-2 lg:col-start-auto">
            <label
              htmlFor="sort"
              className="block text-sm font-semibold text-secondary mb-2"
            >
              Sắp xếp theo
            </label>
            <select
              id="sort"
              className="w-full px-4 py-3 bg-input text-input border-hover rounded-lg focus:outline-none"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        ) : (
          <div className="text-center py-16 section-bg rounded-lg">
            <p className="text-secondary">
              Không tìm thấy thông báo nào phù hợp.
            </p>
          </div>
        )}
      </div>

      {/* Pagination (MỚI) */}
      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default NotificationPage;
