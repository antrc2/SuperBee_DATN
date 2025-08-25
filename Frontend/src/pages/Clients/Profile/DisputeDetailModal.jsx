// src/components/Client/DisputeDetailModal.jsx
"use client";

import { useState } from "react";
import { X, Send, User, Shield } from "lucide-react";
import api from "@utils/http";

// Tiện ích (giống như trong các file khác)
const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");
const DISPUTE_TYPES_MAP = {
  incorrect_login: "Sai thông tin đăng nhập",
  account_banned: "Tài khoản bị khóa/hạn chế",
  wrong_description: "Sản phẩm không đúng mô tả",
  account_retrieved: "Tài khoản bị chủ cũ lấy lại",
  other: "Lý do khác",
};

export const DisputeDetailModal = ({ dispute, onClose, onUpdateSuccess }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState(null);

  if (!dispute) return null;

  // Quyết định xem có cho phép người dùng phản hồi không
  const canReply = dispute.status < 2; // Chỉ cho phản hồi khi đang "Chờ xử lý" hoặc "Đang xử lý"

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsReplying(true);
    setError(null);

    try {
      // Giả định backend có endpoint để user reply khiếu nại
      // API này nên trả về đối tượng dispute đã được cập nhật
      const response = await api.post(`/disputes/${dispute.id}/reply`, {
        message: replyMessage,
      });

      onUpdateSuccess(response.data.data); // Cập nhật lại state ở trang chính
      setReplyMessage(""); // Xóa nội dung đã gửi
    } catch (err) {
      console.error("Failed to post reply:", err);
      setError(
        err.response?.data?.message ||
          "Gửi phản hồi thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-themed">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary">
              Chi tiết Khiếu nại #{dispute.id}
            </h3>
            <p className="text-secondary text-sm">
              {DISPUTE_TYPES_MAP[dispute.dispute_type] || dispute.dispute_type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lịch sử trao đổi */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tin nhắn đầu tiên của bạn */}
          <div className="flex items-start gap-3 justify-end">
            <div className="flex-1 order-1">
              <div className="bg-blue-600/10 dark:bg-blue-500/20 p-3 rounded-lg rounded-tr-none">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                    Bạn
                  </span>
                  <span className="text-xs text-blue-500 dark:text-blue-400">
                    {formatDate(dispute.created_at)}
                  </span>
                </div>
                <p className="text-sm text-primary whitespace-pre-wrap">
                  {dispute.description}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center order-2 text-white">
              <User className="w-4 h-4" />
            </div>
          </div>

          {/* Phản hồi của Admin */}
          {dispute.resolution && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center border border-themed">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <div className="bg-background/80 p-3 rounded-lg rounded-tl-none border border-themed">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-accent">
                      Admin
                    </span>
                    <span className="text-xs text-secondary">
                      {formatDate(dispute.updated_at)}
                    </span>
                  </div>
                  <p className="text-sm text-secondary whitespace-pre-wrap">
                    {dispute.resolution}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Các tin nhắn phản hồi khác (nếu có) sẽ được lặp ở đây */}
        </div>

        {/* Form Phản hồi */}
        {canReply && (
          <div className="p-4 border-t border-themed bg-background/50">
            <form
              onSubmit={handleReplySubmit}
              className="flex items-start gap-3"
            >
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows="2"
                className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover placeholder-theme resize-none"
                placeholder="Nhập tin nhắn của bạn..."
                disabled={isReplying}
              />
              <button
                type="submit"
                className="action-button action-button-primary !w-auto !rounded-lg !p-3"
                disabled={isReplying || !replyMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
