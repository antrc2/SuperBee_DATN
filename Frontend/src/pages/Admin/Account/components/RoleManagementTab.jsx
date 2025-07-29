import React from "react";
import LoadingCon from "@components/Loading/LoadingCon";
const RoleManagementTab = ({
  allRoles,
  selectedRoles,
  handleRoleChange,
  handleSaveChanges,
  updatingRole,
  targetUser,
}) => {
  // Kiểm tra xem người dùng đang xem có phải là admin không
  const isTargetAdmin = targetUser?.roles?.some((r) => r.name === "admin");

  if (isTargetAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-yellow-50 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-300 dark:border-yellow-800 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-yellow-500 dark:text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-semibold text-yellow-800 dark:text-yellow-300">
          Không thể thay đổi quyền
        </h3>
        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-500">
          Bạn không thể chỉnh sửa quyền của một Quản trị viên khác.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
          Quản lý & Cấp quyền
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Chọn các quyền bạn muốn gán cho tài khoản này.
        </p>
      </div>
      <div className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative">
          {updatingRole ? (
            <LoadingCon />
          ) : (
            allRoles.map((role) => {
              // Vô hiệu hóa quyền 'admin'
              const isDisabled = role.name === "admin";
              return (
                <label
                  key={role.id}
                  className={`flex items-center p-4 border rounded-lg transition-colors cursor-pointer 
                                    ${
                                      isDisabled
                                        ? "bg-zinc-100 dark:bg-zinc-800 opacity-60 cursor-not-allowed"
                                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300 dark:has-[:checked]:bg-indigo-900/50 dark:has-[:checked]:border-indigo-700"
                                    }`}
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => handleRoleChange(role.name)}
                    disabled={isDisabled}
                  />
                  <span className="ml-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {role.description || role.name}
                  </span>
                  {isDisabled && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-auto text-zinc-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
        <button
          onClick={handleSaveChanges}
          disabled={updatingRole}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {updatingRole ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default RoleManagementTab;
