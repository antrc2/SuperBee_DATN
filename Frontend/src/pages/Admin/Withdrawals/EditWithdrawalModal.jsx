import React, { useState, useEffect } from "react";

const EditWithdrawalModal = ({ isOpen, onClose, withdrawal, onSave }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    // Reset note khi modal được mở với một yêu cầu mới
    if (withdrawal) {
      setNote(withdrawal.note || "");
    }
  }, [withdrawal]);

  if (!isOpen || !withdrawal) return null;

  const handleSaveClick = () => {
    if (!note.trim()) {
      alert("Vui lòng nhập lý do thất bại.");
      return;
    }
    onSave(withdrawal.id, note);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Đánh dấu Yêu cầu Thất bại
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Bạn đang xử lý yêu cầu{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {withdrawal.withdraw_code}
          </span>
          .
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Trạng thái mới
          </label>
          <input
            type="text"
            value="Thất bại"
            disabled
            className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Ghi chú (Lý do thất bại) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            placeholder="Ví dụ: Thông tin tài khoản không chính xác, hết hạn mức..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Xác nhận Thất bại
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWithdrawalModal;
