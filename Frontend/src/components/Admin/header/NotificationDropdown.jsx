import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { useChat } from "@contexts/ChatContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useChat(); // Lấy dữ liệu từ Context

  const hasNotifications = notifications && notifications.count > 0;

  // Hàm để định dạng thời gian (vd: "khoảng 5 phút trước")
  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return dateString; // Trả về ngày gốc nếu có lỗi
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {/* Icon chuông */}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>

        {/* Badge số lượng thông báo */}
        {hasNotifications && (
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notifications.count}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
          </span>
        )}
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute -right-[120px] mt-4 flex h-auto max-h-[70vh] w-80 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-dark sm:w-96 lg:right-0"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-2 pb-3 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Thông báo
          </h5>
        </div>

        <ul className="flex flex-col overflow-y-auto custom-scrollbar">
          {notifications?.notifications?.length > 0 ? (
            notifications.notifications.map((item) => (
              <li
                key={item.id}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <DropdownItem
                  tag="a"
                  to={item.url || "#"}
                  onItemClick={() => setIsOpen(false)}
                  // Ghi đè class mặc định để có padding phù hợp
                  className="!p-3 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <div className="flex items-start gap-3">
                    {/* AVATAR */}
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-full w-full rounded-full object-cover"
                        src={item.avatar || "/images/user/default-avatar.png"}
                        alt="Notification Avatar"
                      />
                    </div>

                    {/* NỘI DUNG & NGÀY THÁNG */}
                    <div className="flex-1">
                      <p className="mb-1 text-sm text-gray-700 dark:text-gray-300">
                        {/* Giả sử content chứa HTML, dùng dangerouslySetInnerHTML */}
                        {/* Hoặc chỉ hiển thị text: {item.content} */}
                        <span
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(item.createdAt)}
                      </p>
                    </div>

                    {/* TRẠNG THÁI ĐÃ ĐỌC / CHƯA ĐỌC */}
                    {!item.isRead && (
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 mt-1"></div>
                    )}
                  </div>
                </DropdownItem>
              </li>
            ))
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">
              Không có thông báo mới.
            </div>
          )}
        </ul>

        <Link
          to="/notifications"
          onClick={() => setIsOpen(false)}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Xem tất cả
        </Link>
      </Dropdown>
    </div>
  );
}
