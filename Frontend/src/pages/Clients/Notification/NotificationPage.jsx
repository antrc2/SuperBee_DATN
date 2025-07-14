import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import NotificationItem from "../../../components/Client/Notification/NotificationItem";
import Breadcrumbs from "../../../utils/Breadcrumbs";
// Import file cấu hình
import { NOTIFICATION_TYPES } from "../../../config/notification.jsx";

// Mock Data (Dữ liệu giả)
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "promotion",
    content:
      "🔥 Giảm giá 50% tất cả các gói dịch vụ trong dịp lễ! Đừng bỏ lỡ cơ hội vàng để nâng cấp tài khoản của bạn.",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    is_read: false,
  },
  {
    id: 2,
    type: "system",
    content:
      "Bảo trì hệ thống định kỳ sẽ diễn ra vào lúc 02:00 sáng mai. Dịch vụ có thể bị gián đoạn trong ít phút.",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    is_read: false,
  },
  {
    id: 3,
    type: "alert",
    content:
      "Chúng tôi phát hiện một lần đăng nhập đáng ngờ từ một thiết bị lạ. Vui lòng kiểm tra và bảo mật tài khoản của bạn ngay lập tức.",
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    is_read: false,
  },
  {
    id: 4,
    type: "info",
    content:
      "Chào mừng bạn đến với phiên bản mới của trang web! Khám phá ngay các tính năng được cập nhật để có trải nghiệm tốt hơn.",
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    is_read: true,
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filteredNotifications, setFilteredNotifications] =
    useState(MOCK_NOTIFICATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    let result = [...notifications];
    if (searchTerm) {
      result = result.filter((n) =>
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== "all") {
      result = result.filter((n) => n.type === filterType);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    setFilteredNotifications(result);
  }, [searchTerm, filterType, sortOrder, notifications]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3 lg:col-span-2">
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
              {/* Danh sách option được tạo tự động từ file cấu hình */}
              {Object.values(NOTIFICATION_TYPES)
                .filter((type) => type.showInFilter)
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
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
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        ) : (
          <div className="text-center py-16 section-bg">
            <p className="text-secondary">
              Không tìm thấy thông báo nào phù hợp.
            </p>
          </div>
        )}
      </div>

      {/* Pagination (Giao diện tĩnh) */}
      <div className="mt-8 flex justify-center items-center space-x-2">
        <a
          href="#"
          className="px-4 py-2 rounded-lg border-hover bg-input text-secondary"
        >
          Trước
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-lg action-button-primary text-sm w-auto"
        >
          1
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-lg border-hover bg-input text-secondary"
        >
          2
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-lg border-hover bg-input text-secondary"
        >
          Sau
        </a>
      </div>
    </div>
  );
};

export default NotificationPage;
