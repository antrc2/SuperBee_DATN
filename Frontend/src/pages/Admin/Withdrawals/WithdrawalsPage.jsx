import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/http";
import useDebounce from "./useDebounce";

// Import các component con
import FilterControls from "./FilterControls";
import WithdrawalTable from "./WithdrawalTable";
import EditWithdrawalModal from "./EditWithdrawalModal";
import Pagination from "../../../components/Pagination/Pagination";
import { useNotification } from "../../../contexts/NotificationContext";
const WithdrawalsPage = () => {
  // State cho dữ liệu
  const [withdrawals, setWithdrawals] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);

  // State cho việc tải và lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho filter và phân trang
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [currentPage, setCurrentPage] = useState(1);

  // Sử dụng debounce cho giá trị search
  const debouncedSearchTerm = useDebounce(filters.search, 500); // 500ms delay

  // State cho modal sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const {pop} =useNotification()
  // Hàm gọi API chính, sử dụng useCallback để tối ưu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        status: filters.status,
        search: debouncedSearchTerm.trim(), // Gửi giá trị đã debounce
      };

      const response = await api.get("/admin/withdraws", { params });

      const responseData = response.data.data;
      setWithdrawals(responseData.data || []);
      setPaginationMeta(responseData); // Lưu toàn bộ object phân trang
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.status, debouncedSearchTerm]); // Phụ thuộc vào các giá trị này

  // useEffect để gọi API khi các dependencies thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect để reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, debouncedSearchTerm]);

  // Các hàm xử lý sự kiện
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const handleSaveFailure = async (id, note) => {
    try {
      await api.put(`/admin/withdraws/${id}`, { status: 3, note });
      setIsModalOpen(false);
      setSelectedWithdrawal(null);
      await fetchData(); // Tải lại dữ liệu trên trang hiện tại
      alert('Đã cập nhật yêu cầu thành "Thất bại".');
    } catch (err) {
      alert(`Cập nhật thất bại: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleExport = async () => {
    // Logic export không đổi
    try {
      // Chú ý: Backend cần có logic để export đúng các item đang chờ xử lý
      // mà không cần FE gửi ID
      const ab = withdrawals.filter((e) => e.status == 0);
      const ac = [];

      ab.forEach((e) => {
        const { id } = e;
        ac.push(id);
      });
      const a = { withdraw_ids: ac };
      const response = await api.post("/admin/withdraws/export", a);
      // alert(`Export thành công! URL của bạn: ${response.data.url}`);
      window.open(response.data.url, "_blank");
    } catch (err) {
      // alert(`Export thất bại: ${err.response?.data?.message || err.message}`);
      pop(`Export thất bại: ${err.response?.data?.message || err.message}`)
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Quản lý Yêu cầu Rút tiền
      </h1>

      <FilterControls
        filters={filters}
        setFilters={setFilters}
        onExport={handleExport}
      />

      {loading && (
        <p className="text-center p-8 text-gray-500">Đang tải dữ liệu...</p>
      )}
      {error && <p className="text-center p-8 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <WithdrawalTable withdrawals={withdrawals} onEdit={handleEditClick} />
          <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
        </>
      )}

      <EditWithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        withdrawal={selectedWithdrawal}
        onSave={handleSaveFailure}
      />
    </div>
  );
};

export default WithdrawalsPage;
