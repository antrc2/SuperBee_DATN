// src/pages/Admin/Disputes/DisputeDetailPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@utils/http";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Expand,
  X,
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  Paperclip,
  Info,
  MessageSquare,
  Send,
} from "lucide-react";
import { DisputeChatProvider } from "@contexts/DisputeChatContext";
import IntegratedChat from "./ChatWithUserModal"; // Giả sử đây là component chat của bạn

// --- Component con để hiển thị media (Nâng cấp giao diện) ---
const MediaThumbnail = ({ url, onSelect }) => {
  const isVideo = /\.(mp4|mov|webm)$/i.test(url);
  return (
    <div
      onClick={() => onSelect(url)}
      className="relative cursor-pointer group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105"
    >
      {isVideo ? (
        <video src={url} className="w-full h-full object-cover" muted />
      ) : (
        <img
          src={url}
          alt="Attachment"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
        <Expand className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-transform" />
      </div>
    </div>
  );
};

const MediaLightbox = ({ url, onClose }) => {
  if (!url) return null;
  const isVideo = /\.(mp4|mov|webm)$/i.test(url);
  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={url}
            className="max-w-full max-h-[90vh] rounded-lg"
            controls
            autoPlay
          />
        ) : (
          <img
            src={url}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

// --- Component Card dùng chung ---
const Card = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// --- Component chính ---
export default function DisputeDetailPage() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // State cho form cập nhật
  const [newStatus, setNewStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    const fetchDisputeDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/admin/disputes/${id}`);
        if (response.data?.success) {
          setDispute(response.data.data);
          setNewStatus(response.data.data.status.toString());
          setResolution(response.data.data.resolution || "");
        } else {
          throw new Error(response.data.message || "Không tìm thấy dữ liệu.");
        }
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết khiếu nại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDisputeDetail();
  }, [id]);

  const handleUpdateDispute = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ type: "", content: "" });
    try {
      const response = await api.put(`/admin/disputes/${id}`, {
        status: newStatus,
        resolution: resolution,
      });
      if (response.data.success) {
        setDispute(response.data.data);
        setUpdateMessage({ type: "success", content: "Cập nhật thành công!" });
        setTimeout(() => setUpdateMessage({ type: "", content: "" }), 3000); // Tự ẩn thông báo
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.";
      setUpdateMessage({ type: "error", content: errorMsg });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("vi-VN");

  const DISPUTE_STATUS_MAP = {
    0: {
      text: "Chờ xử lý",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
      icon: <Clock className="h-4 w-4" />,
    },
    1: {
      text: "Đang xử lý",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    },
    2: {
      text: "Hoàn thành",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    3: {
      text: "Không chấp nhận",
      className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = {
      0: "Chờ xử lý",
      1: "Đang xử lý",
      2: "Hoàn thành",
      3: "Không chấp nhận",
    };
    if (currentStatus === 2 || currentStatus === 3) {
      return { [currentStatus]: allStatuses[currentStatus] };
    }
    const available = {};
    for (const key in allStatuses) {
      if (parseInt(key) >= currentStatus) available[key] = allStatuses[key];
    }
    return available;
  };

  const currentStatusInfo = DISPUTE_STATUS_MAP[dispute?.status] || {};
  const availableStatuses = dispute ? getAvailableStatuses(dispute.status) : {};
  const isFinalStatus = dispute?.status === 2 || dispute?.status === 3;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md text-center text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Đã xảy ra lỗi</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  if (!dispute) return null;

  return (
    <DisputeChatProvider>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
        <main className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Link
              to="/admin/disputes"
              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách khiếu nại
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Khiếu nại{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  #{dispute.id}
                </span>
              </h1>
              <div
                className={`text-sm font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-2 ${currentStatusInfo.className}`}
              >
                {currentStatusInfo.icon}
                <span>{currentStatusInfo.text}</span>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card
                title="Thông tin chung"
                icon={<Info className="h-5 w-5 text-gray-500" />}
              >
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">
                      Mã đơn hàng
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">
                      <Link
                        to={`/admin/orders/${dispute.order_item?.order?.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {dispute.order_item?.order?.order_code || "N/A"}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">
                      Sản phẩm (SKU)
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">
                      <Link
                        to={`/admin/products/${dispute.order_item?.product?.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {dispute.order_item?.product?.sku || "N/A"}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">
                      Khách hàng
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">
                      <Link
                        to={`/admin/users/${dispute.user?.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {dispute.user?.username || "N/A"}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">
                      Ngày tạo
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">
                      {formatDate(dispute.created_at)}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card
                title="Mô tả của khách hàng"
                icon={<MessageSquare className="h-5 w-5 text-gray-500" />}
              >
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {dispute.description}
                </p>
              </Card>

              <Card
                title="Tài nguyên đính kèm"
                icon={<Paperclip className="h-5 w-5 text-gray-500" />}
              >
                {dispute.attachments?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {dispute.attachments.map((url, index) => (
                      <MediaThumbnail
                        key={index}
                        url={url}
                        onSelect={setSelectedMedia}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Không có tài nguyên nào được đính kèm.
                  </p>
                )}
              </Card>

              <Card
                title="Cập nhật & Phản hồi"
                icon={<Send className="h-5 w-5 text-gray-500" />}
              >
                <form onSubmit={handleUpdateDispute} className="space-y-4">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Trạng thái mới
                    </label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={isFinalStatus || isUpdating}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                      {Object.entries(availableStatuses).map(
                        ([value, text]) => (
                          <option key={value} value={value}>
                            {text}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="resolution"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nội dung phản hồi (gửi cho khách hàng)
                    </label>
                    <textarea
                      id="resolution"
                      rows={4}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      disabled={isUpdating}
                      className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      placeholder="Nhập nội dung giải quyết khiếu nại..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {updateMessage.content && (
                      <p
                        className={`text-sm ${
                          updateMessage.type === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {updateMessage.content}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isUpdating || isFinalStatus}
                      className="inline-flex ml-auto items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Cập nhật
                    </button>
                  </div>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-8">
                <IntegratedChat
                  disputeId={dispute.id}
                  customer={dispute.user}
                />
              </div>
            </div>
          </div>
        </main>
        <MediaLightbox
          url={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      </div>
    </DisputeChatProvider>
  );
}
