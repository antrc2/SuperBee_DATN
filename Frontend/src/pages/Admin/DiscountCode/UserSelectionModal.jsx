import { useState, useMemo, useEffect } from "react";

const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  </svg>
);

const UserSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  allUsers,
  initialSelectedUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Dùng Set để quản lý ID người dùng được chọn tạm thời, giúp thao tác nhanh hơn
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // Khi modal mở, đồng bộ danh sách đã chọn ban đầu vào state tạm thời
  useEffect(() => {
    if (isOpen) {
      const initialIds = new Set(initialSelectedUsers.map((u) => u.id));
      setSelectedUserIds(initialIds);
    }
  }, [isOpen, initialSelectedUsers]);

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    const lowercasedFilter = searchTerm.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, allUsers]);

  // Xử lý khi chọn/bỏ chọn một người dùng
  const handleToggleUser = (userId) => {
    setSelectedUserIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(userId)) {
        newIds.delete(userId);
      } else {
        newIds.add(userId);
      }
      return newIds;
    });
  };

  // Xử lý khi nhấn nút xác nhận
  const handleConfirm = () => {
    // Lọc ra các object user đầy đủ từ danh sách allUsers dựa trên các ID đã chọn
    const selectedUsers = allUsers.filter((u) => selectedUserIds.has(u.id));
    onConfirm(selectedUsers); // Gửi danh sách object user về cho trang cha
    onClose(); // Đóng modal
  };

  // Nếu modal không mở, không render gì cả
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Chọn người dùng áp dụng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <label
                key={user.id}
                htmlFor={`user-${user.id}`}
                className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={selectedUserIds.has(user.id)}
                  onChange={() => handleToggleUser(user.id)}
                  className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <img
                  className="h-10 w-10 rounded-full object-cover bg-gray-100"
                  src={user.avatar_url}
                  alt={`Avatar of ${user.username}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/40x40/e2e8f0/64748b?text=U";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </label>
            ))
          ) : (
            <p className="text-center text-gray-500 p-8">
              Không tìm thấy người dùng nào.
            </p>
          )}
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Đã chọn: {selectedUserIds.size}
          </span>
          <button
            onClick={onClose}
            type="button"
            className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            className="py-2 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;
