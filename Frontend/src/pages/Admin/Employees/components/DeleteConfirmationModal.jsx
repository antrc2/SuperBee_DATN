// File: src/pages/admin/employees/components/DeleteConfirmationModal.jsx
import React, { useState, useEffect } from "react";
import { getEligibleSupportAgents } from "@services/employeeService";

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isLoading,
}) => {
  const [reassignToEmployeeId, setReassignToEmployeeId] = useState("");
  const [eligibleAgents, setEligibleAgents] = useState([]);
  const [isFetchingAgents, setIsFetchingAgents] = useState(false);

  const isSupportRole = employee?.user?.roles?.[0]?.name === "nv-ho-tro";

  useEffect(() => {
    if (isOpen && isSupportRole && employee) {
      const fetchAgents = async () => {
        setIsFetchingAgents(true);
        try {
          const response = await getEligibleSupportAgents(employee.id);
          setEligibleAgents(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách nhân viên bàn giao:", error);
          setEligibleAgents([]);
        } finally {
          setIsFetchingAgents(false);
        }
      };
      fetchAgents();
    }
    if (!isOpen) {
      setReassignToEmployeeId("");
      setEligibleAgents([]);
    }
  }, [isOpen, isSupportRole, employee]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reassignToEmployeeId);
  };

  const canConfirm =
    isLoading ||
    (isSupportRole && !reassignToEmployeeId && eligibleAgents.length > 0);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Xác nhận Vô hiệu hóa
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Bạn có chắc chắn muốn vô hiệu hóa nhân viên{" "}
            <span className="font-semibold">{employee?.user?.username}</span>?
          </p>
        </div>

        {isSupportRole && (
          <div className="mt-4">
            <div className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="font-bold">Lưu ý quan trọng:</p>
              <p>
                Đây là một <strong>Nhân viên Hỗ trợ</strong>. Để tiếp tục, bạn
                phải bàn giao vị trí của họ cho một nhân viên khác.
              </p>
            </div>
            <div className="mt-3">
              <label
                htmlFor="reassign"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Bàn giao cho:
              </label>
              {isFetchingAgents ? (
                <p className="text-sm mt-1">Đang tải danh sách...</p>
              ) : (
                <select
                  id="reassign"
                  value={reassignToEmployeeId}
                  onChange={(e) => setReassignToEmployeeId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-900"
                >
                  <option value="">-- Chọn nhân viên thay thế --</option>
                  {eligibleAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.user.username}
                    </option>
                  ))}
                </select>
              )}
              {eligibleAgents.length === 0 && !isFetchingAgents && (
                <p className="text-xs text-orange-600 mt-1">
                  Không có nhân viên hỗ trợ nào khác để bàn giao.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} disabled={isLoading}>
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={canConfirm}
            className="bg-red-600 text-white ... disabled:bg-red-400"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận Vô hiệu hóa"}
          </button>
        </div>
      </div>
    </div>
  );
};
