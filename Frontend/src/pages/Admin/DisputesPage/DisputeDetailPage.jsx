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
} from "lucide-react";
import { DisputeChatProvider } from "@contexts/DisputeChatContext";
import IntegratedChat from "./ChatWithUserModal"; // Giả sử đây là component chat của bạn

// --- Component con để hiển thị media ---
const MediaThumbnail = ({ url, onSelect }) => {
  const isVideo = /\.(mp4|mov|webm)$/i.test(url);
  return (
    <div
      onClick={() => onSelect(url)}
      className="relative cursor-pointer group aspect-square bg-gray-200 rounded-lg overflow-hidden"
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
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
        <Expand className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
};

const MediaLightbox = ({ url, onClose }) => {
  if (!url) return null;
  const isVideo = /\.(mp4|mov|webm)$/i.test(url);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-4xl"
        >
          <X />
        </button>
        {isVideo ? (
          <video
            src={url}
            className="max-w-full max-h-[85vh]"
            controls
            autoPlay
          />
        ) : (
          <img
            src={url}
            alt="Enlarged view"
            className="max-w-full max-h-[85vh]"
          />
        )}
      </div>
    </div>
  );
};

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
          // Khởi tạo giá trị cho form
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
      className: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-4 w-4" />,
    },
    1: {
      text: "Đang xử lý",
      className: "bg-blue-100 text-blue-800",
      icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    },
    2: {
      text: "Hoàn thành",
      className: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    3: {
      text: "Không chấp nhận",
      className: "bg-red-100 text-red-800",
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
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
        <AlertCircle className="inline-block mr-2" />
        {error}
      </div>
    );
  if (!dispute) return null;

  return (
    <DisputeChatProvider>
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <main className="max-w-7xl mx-auto space-y-6">
          <div>
            <Link
              to="/admin/disputes"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Khiếu nại #{dispute.id}
              </h1>
              <span
                className={`mt-2 sm:mt-0 text-sm font-semibold px-3 py-1 rounded-full inline-flex items-center gap-2 ${currentStatusInfo.className}`}
              >
                {currentStatusInfo.icon} {currentStatusInfo.text}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Card thông tin chung, mô tả, tài nguyên... (giữ nguyên) */}
              <div className="bg-white p-5 shadow-sm rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                  Thông tin chung
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Mã đơn hàng</dt>
                    <dd className="mt-1 text-gray-900">
                      <Link
                        to={`/admin/orders/${dispute.order_item?.order?.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {dispute.order_item?.order?.order_code || "N/A"}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Sản phẩm</dt>
                    <dd className="mt-1 text-gray-900">
                      <Link
                        to={`/admin/products/${dispute.order_item?.product?.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        SKU: {dispute.order_item?.product?.sku || "N/A"}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Khách hàng</dt>
                    <dd className="mt-1 text-gray-900">
                      <Link
                        to={`/admin/users/${dispute.user?.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {dispute.user?.username || "N/A"}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Ngày tạo</dt>
                    <dd className="mt-1 text-gray-900">
                      {formatDate(dispute.created_at)}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="bg-white p-5 shadow-sm rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                  Mô tả của khách hàng
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {dispute.description}
                </p>
              </div>
              <div className="bg-white p-5 shadow-sm rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                  Tài nguyên đính kèm
                </h3>
                {dispute.attachments?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {dispute.attachments.map((url, index) => (
                      <MediaThumbnail
                        key={index}
                        url={url}
                        onSelect={setSelectedMedia}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Không có tài nguyên nào.</p>
                )}
              </div>

              {/* === CARD CẬP NHẬT TRẠNG THÁI MỚI === */}
              <div className="bg-white p-5 shadow-sm rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                  Cập nhật trạng thái
                </h3>
                <form onSubmit={handleUpdateDispute} className="space-y-4">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Trạng thái mới
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={isFinalStatus || isUpdating}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nội dung phản hồi (gửi cho khách hàng)
                    </label>
                    <textarea
                      id="resolution"
                      name="resolution"
                      rows={4}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      disabled={isUpdating}
                      className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                      placeholder="Nhập nội dung giải quyết khiếu nại..."
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={isUpdating || isFinalStatus}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}{" "}
                      Cập nhật
                    </button>
                  </div>
                  {updateMessage.content && (
                    <p
                      className={`text-sm mt-2 text-center ${
                        updateMessage.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {updateMessage.content}
                    </p>
                  )}
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <IntegratedChat disputeId={dispute.id} customer={dispute.user} />
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
