import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Plus,
  Briefcase,
  UserCheck,
  MessageSquareWarning,
  Megaphone,
  CircleDollarSign,
} from "lucide-react";
import { getAgentSlotStats, createAgentSlot } from "@services/employeeService";

// Mapping role names to icons and details for better UI
const roleDetails = {
  "nv-ho-tro-support": {
    icon: <UserCheck size={20} />,
    title: "Nhân viên Hỗ trợ",
    type: "support",
    roleName: "nv-ho-tro",
  },
  "nv-ho-tro-complaint": {
    icon: <MessageSquareWarning size={20} />,
    title: "NV Xử lý Khiếu nại",
    type: "complaint",
    roleName: "nv-ho-tro",
  },
  "nv-marketing": {
    icon: <Megaphone size={20} />,
    title: "Nhân viên Marketing",
    roleName: "nv-marketing",
  },
  "ke-toan": {
    icon: <CircleDollarSign size={20} />,
    title: "Kế toán",
    roleName: "ke-toan",
  },
};

/**
 * Modal để người dùng chọn vai trò trước khi tạo nhân viên mới.
 * Có kiểm tra slot trống và cho phép tạo slot mới ngay trên modal.
 */
export const SelectRoleModal = ({ isOpen, onClose, roles }) => {
  const navigate = useNavigate();
  const [slotStats, setSlotStats] = useState(null);
  const [showCreateSlotForm, setShowCreateSlotForm] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    display_name: "",
    type: "support",
  });
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSlotStats();
    }
  }, [isOpen]);

  const fetchSlotStats = async () => {
    setIsLoadingStats(true);
    setError("");
    setSuccess("");
    try {
      const response = await getAgentSlotStats();
      setSlotStats(response.data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê slot:", err);
      setError("Không thể tải thống kê vị trí.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRoleSelect = (details) => {
    // Nếu không phải vai trò hỗ trợ, chuyển thẳng
    if (!details.type) {
      navigate(`/admin/employees/new?role=${details.roleName}`);
      onClose();
      return;
    }

    // Kiểm tra slot trống cho vai trò hỗ trợ
    const hasAvailableSlots = slotStats?.[details.type]?.available > 0;

    if (hasAvailableSlots) {
      navigate(
        `/admin/employees/new?role=${details.roleName}&type=${details.type}`
      );
      onClose();
    } else {
      setError(
        `Đã hết vị trí trống cho ${details.title}. Vui lòng tạo thêm vị trí mới.`
      );
      setShowCreateSlotForm(true); // Tự động hiển thị form tạo
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlotData.display_name.trim()) {
      setError("Vui lòng nhập tên vị trí.");
      return;
    }
    setIsCreatingSlot(true);
    setError("");
    setSuccess("");
    try {
      await createAgentSlot(newSlotData);
      setSuccess("Tạo vị trí mới thành công!");
      await fetchSlotStats(); // Làm mới thống kê
      setNewSlotData({ display_name: "", type: "support" });
      setShowCreateSlotForm(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra khi tạo vị trí mới.";
      setError(errorMessage);
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleClose = () => {
    setShowCreateSlotForm(false);
    setNewSlotData({ display_name: "", type: "support" });
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  // Tạo danh sách các lựa chọn để render, tách biệt 2 loại NV Hỗ trợ
  const availableChoices = roles
    .flatMap((role) => {
      if (role.name === "nv-ho-tro") {
        return [
          roleDetails["nv-ho-tro-support"],
          roleDetails["nv-ho-tro-complaint"],
        ];
      }
      return (
        roleDetails[role.name] || {
          icon: <Briefcase size={20} />,
          title: role.description,
          roleName: role.name,
        }
      );
    })
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Thêm Nhân viên mới
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Chọn loại nhân viên bạn muốn tạo. Với nhân viên hỗ trợ, hệ thống sẽ
          kiểm tra vị trí trống.
        </p>

        {/* Khu vực thông báo */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md"
            role="alert"
          >
            <p>{success}</p>
          </div>
        )}

        {/* Thống kê slot */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Thống kê vị trí hỗ trợ:
          </h4>
          {isLoadingStats ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Hỗ trợ chung:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {slotStats?.support?.available ?? 0}/
                  {slotStats?.support?.total ?? 0} trống
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Xử lý khiếu nại:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {slotStats?.complaint?.available ?? 0}/
                  {slotStats?.complaint?.total ?? 0} trống
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Danh sách lựa chọn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {availableChoices.map((details) => {
            const hasSlots =
              !details.type || slotStats?.[details.type]?.available > 0;
            return (
              <button
                key={details.title}
                onClick={() => handleRoleSelect(details)}
                disabled={isLoadingStats || !hasSlots}
                className={`flex flex-col items-center justify-center text-center p-4 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 ${
                  hasSlots
                    ? "border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-400"
                    : "border-red-300 bg-red-50 dark:bg-red-900/20 cursor-not-allowed"
                }`}
              >
                <div
                  className={
                    hasSlots
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-red-500"
                  }
                >
                  {details.icon}
                </div>
                <p
                  className={`font-semibold mt-2 ${
                    hasSlots
                      ? "text-gray-800 dark:text-gray-200"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {details.title}
                </p>
                {!hasSlots && (
                  <div className="flex items-center text-xs text-red-500 mt-1">
                    <AlertTriangle size={12} className="mr-1" />
                    Hết vị trí
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Form tạo slot mới */}
        {showCreateSlotForm && (
          <form
            onSubmit={handleCreateSlot}
            className="border-t dark:border-gray-700 pt-6 mt-6"
          >
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              Tạo nhanh vị trí mới
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên vị trí
                </label>
                <input
                  type="text"
                  value={newSlotData.display_name}
                  onChange={(e) =>
                    setNewSlotData((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Hỗ trợ viên Ca Tối"
                  className="mt-1 block w-full input-style"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loại vị trí
                </label>
                <select
                  value={newSlotData.type}
                  onChange={(e) =>
                    setNewSlotData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full input-style"
                >
                  <option value="support">Hỗ trợ chung</option>
                  <option value="complaint">Xử lý khiếu nại</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateSlotForm(false)}
                disabled={isCreatingSlot}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCreatingSlot || !newSlotData.display_name.trim()}
                className="btn-primary bg-green-600 hover:bg-green-700 disabled:bg-green-400"
              >
                <Plus size={16} className="mr-1" />
                {isCreatingSlot ? "Đang tạo..." : "Tạo vị trí"}
              </button>
            </div>
          </form>
        )}

        {/* Nút Đóng */}
        <div className="mt-6 flex justify-end border-t dark:border-gray-700 pt-4">
          <button onClick={handleClose} className="btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
