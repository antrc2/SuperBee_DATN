// Gợi ý đường dẫn: src/pages/Admin/Disputes/DisputeDetailPage.jsx

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@utils/http";
import ChatWithUserModal from "./ChatWithUserModal"; // Đảm bảo import component modal

const DISPUTE_STATUS_OPTIONS = {
  1: "Đang xử lý",
  2: "Chấp nhận (Đã giải quyết)",
  3: "Từ chối",
};

export default function DisputeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStatus, setNewStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", content: "" });

  // State và hàm cho Chat Modal
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleOpenChat = () => {
    if (dispute?.user) {
      setIsChatModalOpen(true);
    }
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };

  useEffect(() => {
    if (!id) return;

    const fetchDisputeDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/admin/disputes/${id}`);
        const disputeData = response.data;
        setDispute(disputeData);
        setNewStatus(disputeData.status > 0 ? String(disputeData.status) : "1");
        setResolution(disputeData.resolution || "");
      } catch (err) {
        setError(
          "Không thể tải chi tiết khiếu nại hoặc khiếu nại không tồn tại."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputeDetail();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!resolution.trim()) {
      setUpdateMessage({
        type: "error",
        content: "Vui lòng nhập ghi chú xử lý.",
      });
      return;
    }
    setIsUpdating(true);
    setUpdateMessage({ type: "", content: "" });
    try {
      await api.put(`/admin/disputes/${id}`, {
        status: newStatus,
        resolution: resolution,
      });
      setUpdateMessage({
        type: "success",
        content: "Cập nhật thành công! Đang chuyển hướng...",
      });
      setTimeout(() => {
        navigate("/admin/disputes");
      }, 2000);
    } catch (err) {
      setUpdateMessage({
        type: "error",
        content: err.response?.data?.message || "Lỗi khi cập nhật.",
      });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        Đang tải chi tiết...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-red-500 mb-4">{error}</p>
        <Link
          to="/admin/disputes"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!dispute) return null;

  let attachments = [];
  try {
    if (dispute.attachments) attachments = dispute.attachments;
  } catch (e) {
    console.error("Failed to parse attachments JSON:", e);
  }

  return (
    <>
      {" "}
      {/* Bọc trong Fragment để chứa cả modal */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Link
              to="/admin/disputes"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              &larr; Quay lại danh sách
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
              Chi tiết Khiếu nại #{dispute.id}
            </h1>
          </div>

          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            {/* Cột thông tin khiếu nại (trái) */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Thông tin Chung
                </h2>
                <div className="space-y-3 text-sm p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Người dùng:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-left sm:text-right">
                      {dispute.user?.username || "N/A"} (
                      {dispute.user?.email || "N/A"})
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Mã đơn hàng:
                    </span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">
                      {dispute.order_item?.order?.order_code || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      Loại sự cố:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {dispute.dispute_type}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Hành động nhanh
                </h3>
                <div className="flex flex-wrap gap-3">
                  {dispute.user && (
                    <Link
                      to={`/admin/users/${dispute.user.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Xem chi tiết người dùng
                    </Link>
                  )}
                  {dispute.order_item?.order && (
                    <Link
                      to={`/admin/orders/${dispute.order_item.order.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Xem chi tiết đơn hàng
                    </Link>
                  )}
                  {dispute.user && (
                    <button
                      type="button"
                      onClick={handleOpenChat}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Nhắn tin với người dùng
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả của người dùng:
                </label>
                <div className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[100px]">
                  {dispute.description}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ảnh bằng chứng:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.length > 0 ? (
                    attachments.map((path, index) => (
                      <a
                        key={index}
                        href={`${path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square group"
                      >
                        <img
                          src={`${path}`}
                          alt={`attachment-${index}`}
                          className="w-full h-full object-cover rounded-md border border-gray-300 dark:border-gray-600 group-hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">
                      Không có ảnh đính kèm.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cột xử lý của Admin (phải) */}
            <div className="lg:col-span-2 lg:border-l lg:pl-8 border-gray-200 dark:border-gray-700 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Xử lý Khiếu nại
              </h2>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cập nhật trạng thái
                </label>
              <select
  id="status"
  value={newStatus}
  onChange={(e) => setNewStatus(e.target.value)}
  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
>
  {Object.entries(DISPUTE_STATUS_OPTIONS)
    .filter(([key]) => Number(key) >= Number(dispute.status)) // Chỉ cho phép bằng hoặc lớn hơn
    .map(([key, value]) => (
      <option key={key} value={key}>
        {value}
      </option>
    ))}
</select>

              </div>
              <div>
                <label
                  htmlFor="resolution"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ghi chú xử lý (bắt buộc)
                </label>
                <textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows="8"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                  placeholder="Nhập chi tiết cách giải quyết, lý do từ chối..."
                ></textarea>
              </div>

              {updateMessage.content && (
                <div
                  className={`text-sm p-3 rounded-md ${
                    updateMessage.type === "success"
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                  }`}
                >
                  {updateMessage.content}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating && (
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  )}
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
      {/* Render Modal Chat */}
      {isChatModalOpen && (
        <ChatWithUserModal user={dispute.user} onClose={handleCloseChat} />
      )}
    </>
  );
}
