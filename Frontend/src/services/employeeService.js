// File: src/services/employeeService.js
import api from "@utils/http";

const API_BASE = "/admin/employees";

// Lấy danh sách nhân viên với filter và pagination
export const getEmployees = async (params = {}) => {
  return await api.get(API_BASE, { params });
};

// Lấy thông tin chi tiết một nhân viên
export const getEmployeeById = async (id) => {
  return await api.get(`${API_BASE}/${id}`);
};

// Lấy dữ liệu để khởi tạo form (roles)
export const getFormData = async () => {
  return await api.get(`${API_BASE}/form-data`);
};

// Kiểm tra slot trống cho vai trò hỗ trợ
export const checkAvailableSlots = async (roleId) => {
  return await api.get(`${API_BASE}/check-slots`, {
    params: { role_id: roleId },
  });
};

// Tạo nhân viên mới
export const createEmployee = async (data) => {
  return await api.post(API_BASE, data);
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (id, data) => {
  return await api.put(`${API_BASE}/${id}`, data);
};

// Vô hiệu hóa nhân viên (với bàn giao nếu cần) - Có thể không cần dùng nữa
export const deleteEmployee = async (id, reassignmentData = {}) => {
  return await api.delete(`${API_BASE}/${id}`, { data: reassignmentData });
};

// Lấy danh sách nhân viên hỗ trợ hợp lệ để bàn giao
export const getEligibleSupportAgents = async (excludeEmployeeId) => {
  return await api.get(
    `${API_BASE}/eligible-support-agents/${excludeEmployeeId}`
  );
};

// Lấy thống kê về slots và assignments
export const getAgentSlotStats = async () => {
  return await api.get(`${API_BASE}/agent-slot-stats`);
};

// Tạo slot agent mới
export const createAgentSlot = async (data) => {
  return await api.post(`${API_BASE}/create-agent-slot`, data);
};

/**
 * Cập nhật trạng thái (Khóa/Mở khóa) của nhân viên.
 * @param {string|number} employeeId ID của nhân viên
 * @param {object|null} payload Dữ liệu gửi kèm, ví dụ { reassign_to_employee_id: ... }
 * @returns {Promise}
 */
export const toggleEmployeeStatus = (employeeId, payload = null) => {
  // Dùng PATCH và đúng endpoint /status
  return api.patch(`${API_BASE}/${employeeId}/status`, payload);
};
