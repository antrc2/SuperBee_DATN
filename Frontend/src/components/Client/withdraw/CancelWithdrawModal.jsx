import React from "react";

const CancelWithdrawModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-background rounded-lg p-6 shadow-themed max-w-sm w-full">
        <h3 className="font-heading text-lg font-bold text-primary">
          Xác nhận hủy yêu cầu
        </h3>
        <p className="text-secondary my-4">
          Bạn có chắc chắn muốn hủy yêu cầu rút tiền này không? Hành động này
          không thể hoàn tác.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="modal-button modal-button-cancel"
          >
            Không
          </button>
          <button
            onClick={onConfirm}
            className="modal-button modal-button-confirm bg-gradient-danger text-white"
          >
            Chắc chắn
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelWithdrawModal;
