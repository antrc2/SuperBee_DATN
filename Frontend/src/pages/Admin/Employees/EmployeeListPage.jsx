// File: src/pages/admin/employees/EmployeeListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getEmployees,
  toggleEmployeeStatus,
  getEligibleSupportAgents,
} from "@services/employeeService";
import { FilePenLine, UserX, UserCheck, ShieldAlert } from "lucide-react";

// Hook useDebounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Component StatusBadge
const StatusBadge = ({ status }) => {
  const statusMap = {
    active: { text: "Hoạt động", color: "bg-green-100 text-green-800" },
    on_leave: { text: "Nghỉ phép", color: "bg-yellow-100 text-yellow-800" },
    terminated: { text: "Đã khóa", color: "bg-red-100 text-red-800" },
  };
  const { text, color } = statusMap[status] || {
    text: status,
    color: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}
    >
      {text}
    </span>
  );
};

// Component Modal xác nhận - được viết lại để xử lý logic bàn giao
const StatusConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isLoading,
}) => {
  const [eligibleAgents, setEligibleAgents] = useState([]);
  const [isFetchingAgents, setIsFetchingAgents] = useState(false);
  const [reassignToEmployeeId, setReassignToEmployeeId] = useState("");

  const isSupportAgent = employee?.user?.roles?.[0]?.name === "nv-ho-tro";
  const isTerminating = employee?.status !== "terminated";
  const needsReassignment = isSupportAgent && isTerminating;

  useEffect(() => {
    // Nếu modal mở ra để khóa một NV hỗ trợ, gọi API lấy danh sách NV khác để bàn giao
    if (isOpen && needsReassignment) {
      setIsFetchingAgents(true);
      getEligibleSupportAgents(employee.id)
        .then((response) => {
          setEligibleAgents(response.data);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh sách nhân viên bàn giao:", error);
          alert("Lỗi: Không thể tải danh sách nhân viên để bàn giao.");
        })
        .finally(() => setIsFetchingAgents(false));
    } else {
      setEligibleAgents([]);
    }
    // Reset state khi đóng/mở modal
    setReassignToEmployeeId("");
  }, [isOpen, needsReassignment, employee]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (
      needsReassignment &&
      eligibleAgents.length > 0 &&
      !reassignToEmployeeId
    ) {
      alert("Vui lòng chọn một nhân viên để bàn giao công việc.");
      return;
    }
    const payload = reassignToEmployeeId
      ? { reassign_to_employee_id: reassignToEmployeeId }
      : null;
    onConfirm(payload);
  };

  const title = isTerminating
    ? "Xác nhận Khóa tài khoản"
    : "Xác nhận Mở khóa tài khoản";
  const message = `Bạn có chắc chắn muốn ${
    isTerminating ? "khóa" : "mở khóa"
  } tài khoản của nhân viên "${employee?.user?.username}" không?`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* PHẦN LOGIC BÀN GIAO */}
        {needsReassignment && (
          <div className="mt-4">
            {isFetchingAgents ? (
              <p className="text-sm text-gray-500">
                Đang tải danh sách nhân viên bàn giao...
              </p>
            ) : eligibleAgents.length > 0 ? (
              <>
                <label
                  htmlFor="reassign"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Đây là nhân viên hỗ trợ. Vui lòng chọn người nhận bàn giao
                  công việc:
                </label>
                <select
                  id="reassign"
                  value={reassignToEmployeeId}
                  onChange={(e) => setReassignToEmployeeId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {eligibleAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.user.username}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 p-3 rounded-md">
                Không có nhân viên hỗ trợ nào khác để bàn giao. Có thể khóa trực
                tiếp.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            disabled={isLoading || isFetchingAgents}
            onClick={handleConfirm}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    per_page: 10,
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        search: debouncedSearch,
        page: filters.page,
      };
      const response = await getEmployees(params);
      setEmployees(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.status, debouncedSearch]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.last_page) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const openConfirmModal = (employee) => {
    setSelectedEmployee(employee);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedEmployee(null);
    setIsConfirmModalOpen(false);
  };

  // HÀM XỬ LÝ CHÍNH ĐÃ ĐƯỢC CẬP NHẬT
  const handleConfirmToggleStatus = async (payload) => {
    if (!selectedEmployee) return;
    setIsUpdatingStatus(true);
    try {
      // Gọi service toggleEmployeeStatus với ID và payload (nếu có)
      await toggleEmployeeStatus(selectedEmployee.id, payload);
      alert("Cập nhật trạng thái nhân viên thành công!");
      closeConfirmModal();
      fetchEmployees(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
      const errorMessage = error.response?.data?.message || "Đã có lỗi xảy ra.";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans ">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý Nhân viên
        </h1>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/admin/employees/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Thêm Nhân viên mới
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Tìm theo mã NV, username..."
          className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="on_leave">Nghỉ phép</option>
          <option value="terminated">Đã khóa</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">{/* thead */}</thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    Đang tải...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    Không tìm thấy nhân viên.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {employee.user?.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {employee.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.user?.roles?.[0]?.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={employee.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(employee.start_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <Link
                        to={`/admin/employees/${employee.id}/edit`}
                        title="Sửa"
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-block"
                      >
                        <FilePenLine size={18} />
                      </Link>
                      {employee.status === "terminated" ? (
                        <button
                          onClick={() => openConfirmModal(employee)}
                          title="Kích hoạt lại"
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => openConfirmModal(employee)}
                          title="Khóa tài khoản"
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <UserX size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && pagination.total > 0 && (
        <div className="py-4 flex items-center justify-between">
          {/* Pagination UI */}
        </div>
      )}

      {/* Sử dụng Modal mới */}
      <StatusConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmToggleStatus}
        employee={selectedEmployee}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
};
