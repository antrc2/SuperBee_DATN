// src/app/(client)/user/disputes/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import api from "../../../utils/http";
import LoadingCon from "@components/Loading/LoadingCon";
import { DisputeDetailModal } from "@components/Client/DisputeDetailModal"; // <-- Component mới sẽ tạo ở bước 2

// Tiện ích định dạng (có thể dùng lại từ file HistoryOrder)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Map các loại khiếu nại để hiển thị cho thân thiện
const DISPUTE_TYPES_MAP = {
  incorrect_login: "Sai thông tin đăng nhập",
  account_banned: "Tài khoản bị khóa/hạn chế",
  wrong_description: "Sản phẩm không đúng mô tả",
  account_retrieved: "Tài khoản bị chủ cũ lấy lại",
  other: "Lý do khác",
};

export default function DisputeHistoryPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Giả định API endpoint là '/disputes' để lấy các khiếu nại của user đang đăng nhập
        const response = await api.get("/disputes");
        // Sắp xếp cho các khiếu nại mới nhất lên đầu
        const sortedData = response.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setDisputes(sortedData);
      } catch (err) {
        console.error("Failed to fetch disputes:", err);
        setError("Không thể tải danh sách khiếu nại. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const handleViewDetails = async (disputeId) => {
    try {
      // API để lấy chi tiết 1 khiếu nại, bao gồm cả tin nhắn phản hồi
      const response = await api.get(`/disputes/${disputeId}`);
      setSelectedDispute(response.data.data);
    } catch (error) {
      console.error("Failed to fetch dispute details:", error);
      setError("Không thể tải chi tiết khiếu nại.");
    }
  };

  const handleCloseModal = () => {
    setSelectedDispute(null);
  };

  const handleUpdateOnSuccess = (updatedDispute) => {
    // Cập nhật lại danh sách khi người dùng gửi tin nhắn thành công
    setDisputes((currentDisputes) =>
      currentDisputes.map((d) =>
        d.id === updatedDispute.id ? updatedDispute : d
      )
    );
    // Cập nhật lại dữ liệu trong modal
    setSelectedDispute(updatedDispute);
  };

  const renderStatus = (status) => {
    const statusMap = {
      0: {
        text: "Chờ xử lý",
        icon: <Clock className="h-4 w-4" />,
        className: "text-yellow-500 bg-yellow-500/10",
      },
      1: {
        text: "Đang xử lý",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        className: "text-blue-500 bg-blue-500/10",
      },
      2: {
        text: "Đã giải quyết",
        icon: <CheckCircle className="h-4 w-4" />,
        className: "text-green-500 bg-green-500/10",
      },
      3: {
        text: "Đã từ chối",
        icon: <XCircle className="h-4 w-4" />,
        className: "text-red-500 bg-red-500/10",
      },
    };
    const current = statusMap[status] || {
      text: "Không rõ",
      icon: <HelpCircle className="h-4 w-4" />,
      className: "bg-gray-500/20 text-gray-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${current.className}`}
      >
        {current.icon}
        {current.text}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) return <LoadingCon />;
    if (error)
      return (
        <div className="alert alert-danger">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      );
    if (disputes.length === 0) {
      return (
        <div className="text-center p-10 bg-background rounded-lg border border-themed">
          <MessageSquare className="w-12 h-12 mx-auto text-secondary/50 mb-4" />
          <h3 className="text-lg font-semibold text-primary">
            Chưa có khiếu nại nào
          </h3>
          <p className="text-secondary mt-1">
            Bạn chưa từng tạo yêu cầu hỗ trợ nào.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="bg-background p-4 rounded-xl border border-themed transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
              <div>
                <p className="font-bold text-primary font-heading">
                  {DISPUTE_TYPES_MAP[dispute.dispute_type] || "Lý do khác"}
                </p>
                <p className="text-sm text-secondary">
                  Sản phẩm SKU: {dispute.order_item?.product?.sku || "N/A"}
                </p>
                <p className="text-xs text-secondary/80 mt-1">
                  Mã đơn hàng: #{dispute.order_item?.order?.order_code || "N/A"}
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                {renderStatus(dispute.status)}
                <p className="text-xs text-secondary font-mono">
                  {formatDate(dispute.created_at)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-themed flex justify-between items-center">
              <p className="text-sm text-secondary italic truncate pr-4">
                "{dispute.description}"
              </p>
              <button
                onClick={() => handleViewDetails(dispute.id)}
                className="action-button action-button-secondary !w-auto !py-2 !px-4 !text-sm flex-shrink-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          Lịch sử Khiếu nại
        </h1>
        <p className="text-secondary mt-1">
          Theo dõi và trao đổi với quản trị viên về các sự cố bạn đã báo cáo.
        </p>
      </div>

      <div className="min-h-[20rem]">{renderContent()}</div>

      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          onClose={handleCloseModal}
          onUpdateSuccess={handleUpdateOnSuccess}
        />
      )}
    </section>
  );
}
