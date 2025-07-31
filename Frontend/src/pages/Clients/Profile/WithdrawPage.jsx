import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/http";
import WithdrawHistory from "../../../components/Client/withdraw/WithdrawHistory";
import WithdrawForm from "../../../components/Client/withdraw/WithdrawForm";
import CancelWithdrawModal from "../../../components/Client/withdraw/CancelWithdrawModal";
import LoadingCon from "@components/Loading/LoadingCon";
import { useNotification } from "../../../contexts/NotificationContext";

const WithdrawPage = () => {
  const [view, setView] = useState("history"); // 'history' hoặc 'form'
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingWithdrawal, setEditingWithdrawal] = useState(null);
  const { pop } = useNotification();
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const isCancelModalOpen = !!cancelTargetId;

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/withdraws"); // GET /withdraws
      setWithdrawals(response.data.data);
    } catch (error) {
      //   showToast("Không thể tải lịch sử rút tiền.");
      pop("Không thể tải lịch sử rút tiền.", "e");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "history") {
      fetchWithdrawals();
    }
  }, [view, fetchWithdrawals]);

  const handleShowCreateForm = () => {
    setEditingWithdrawal(null);
    setView("form");
  };

  const handleEdit = (withdrawal) => {
    setEditingWithdrawal(withdrawal);
    setView("form");
  };

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    try {
      await api.delete(`/withdraws/${cancelTargetId}`); // DELETE /withdraws/{id}
      pop("Yêu cầu đã được hủy thành công.", "s");
      setCancelTargetId(null);
      fetchWithdrawals(); // Tải lại danh sách
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Hủy yêu cầu thất bại.";
      pop(errorMessage, "e");
    }
  };

  const handleFormSuccess = () => {
    setView("history");
    setEditingWithdrawal(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {view === "history" ? (
        <>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Lịch Sử Rút Tiền
            </h1>
            <button
              onClick={handleShowCreateForm}
              className="action-button action-button-primary px-4 py-2 text-sm !w-auto"
            >
              + Tạo Yêu Cầu
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingCon />
            </div>
          ) : (
            <WithdrawHistory
              data={withdrawals}
              onEdit={handleEdit}
              onCancelRequest={setCancelTargetId}
            />
          )}
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button
              onClick={() => setView("history")}
              className="text-secondary hover:text-primary mr-4 p-1 rounded-full hover:bg-tertiary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="font-heading text-3xl font-bold text-primary">
              {editingWithdrawal ? "Chỉnh Sửa Yêu Cầu" : "Tạo Yêu Cầu Mới"}
            </h1>
          </div>
          <WithdrawForm
            initialData={editingWithdrawal}
            onSuccess={handleFormSuccess}
          />
        </>
      )}

      <CancelWithdrawModal
        isOpen={isCancelModalOpen}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default WithdrawPage;
