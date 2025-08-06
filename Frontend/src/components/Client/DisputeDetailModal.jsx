// src/components/Client/DisputeDetailModal.jsx
"use client";

import { X, User, ShieldCheck } from "lucide-react";

// Map các loại khiếu nại để hiển thị cho thân thiện
const DISPUTE_TYPES_MAP = {
  incorrect_login: "Sai thông tin đăng nhập",
  account_banned: "Tài khoản bị khóa/hạn chế",
  wrong_description: "Sản phẩm không đúng mô tả",
  account_retrieved: "Tài khoản bị chủ cũ lấy lại",
  other: "Lý do khác",
};

export const DisputeDetailModal = ({ dispute, onClose }) => {
  console.log("🚀 ~ DisputeDetailModal ~ dispute:", dispute.attachments);
  if (!dispute) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-themed">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary">
              Chi tiết Khiếu nại
            </h3>
            <p className="text-secondary text-sm">
              {DISPUTE_TYPES_MAP[dispute.dispute_type]} - SKU:{" "}
              {dispute.order_item?.product?.sku || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Nội dung chi tiết */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-background">
          {/* Thông tin khiếu nại của người dùng */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-input border border-themed flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="w-full">
              <div className="p-3 rounded-lg bg-input border border-themed">
                <p className="text-sm text-primary font-semibold">
                  Nội dung khiếu nại của bạn
                </p>
                <p className="text-sm text-secondary mt-2 whitespace-pre-wrap">
                  {dispute.description}
                </p>
                {/* Hiển thị ảnh bằng chứng ban đầu nếu có */}
                {dispute.attachments && dispute.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-primary font-semibold mb-2">
                      Ảnh bằng chứng:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {dispute?.attachments?.map((url, index) => {
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square block"
                          >
                            <img
                              src={url}
                              alt={`attachment ${index + 1}`}
                              className="rounded-md object-cover w-full h-full border border-themed"
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-secondary/70 mt-1">
                Ngày gửi: {new Date(dispute.created_at).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* === PHẦN ĐÃ CẬP NHẬT: PHẢN HỒI CỦA ADMIN === */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent/20 border border-themed flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <div className="w-full">
              <div
                className={`p-3 rounded-lg bg-input ${
                  dispute.resolution
                    ? "border-2 border-accent/50"
                    : "border border-themed"
                }`}
              >
                <p className="text-sm text-primary font-semibold">
                  Phản hồi từ Quản trị viên
                </p>
                {dispute.resolution ? (
                  // Nếu CÓ phản hồi
                  <p className="text-sm text-secondary mt-2 whitespace-pre-wrap">
                    {dispute.resolution}
                  </p>
                ) : (
                  // Nếu CHƯA CÓ phản hồi
                  <p className="text-sm text-secondary/70 mt-2 italic">
                    Chưa có phản hồi cho khiếu nại này.
                  </p>
                )}
              </div>
              {/* Chỉ hiển thị ngày phản hồi nếu có */}
              {dispute.resolution && (
                <p className="text-xs text-secondary/70 mt-1">
                  Ngày phản hồi:{" "}
                  {new Date(dispute.updated_at).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-themed bg-background/50 text-right flex-shrink-0">
          <button
            onClick={onClose}
            className="action-button action-button-secondary !w-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
