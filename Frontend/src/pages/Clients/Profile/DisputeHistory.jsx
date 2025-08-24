// src/app/(client)/user/disputes/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  AlertCircle,
  X,
  Send,
  Shield,
  Video,
  Image as ImageIcon,
  Calendar,
  FileText,
} from "lucide-react";
import api from "../../../utils/http";
import LoadingCon from "@components/Loading/LoadingCon";
import { useAuth } from "@contexts/AuthContext"; // Giả định bạn có context này

// =====================================================================
// COMPONENT POPUP XEM MEDIA (LIGHTBOX)
// =====================================================================
const MediaLightbox = ({ url, onClose }) => {
  const isVideo = [".mp4", ".webm", ".mov"].some((ext) =>
    url.toLowerCase().endsWith(ext)
  );
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 bg-black/80 z-[70] flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-lg max-w-4xl max-h-[90vh] w-full h-auto flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 text-gray-800 dark:text-gray-200 hover:scale-110 transition-transform"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
        {isVideo ? (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full max-h-[90vh] object-contain rounded-lg"
          />
        ) : (
          <img
            src={url}
            alt="Bằng chứng phóng to"
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

// =====================================================================
// COMPONENT POPUP CHI TIẾT KHIẾU NẠI (MODAL) - ĐÃ VIẾT LẠI HOÀN TOÀN
// =====================================================================
const DisputeDetailModal = ({ dispute, onClose }) => {
  const { user: currentUser } = useAuth();
  const [chatMessage, setChatMessage] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (dispute?.chatInfo?.messages) {
      setMessages(dispute.chatInfo.messages);
    }
  }, [dispute]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!dispute) return null;

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      // THAY THẾ BẰNG API GỬI TIN NHẮN THỰC TẾ
      // const response = await api.post(`/chat/disputes/${dispute.id}/messages`, { content: chatMessage });
      // setMessages(prev => [...prev, response.data.data]);

      const newMessage = {
        id: Date.now(),
        content: chatMessage,
        sender_id: currentUser.id,
        created_at: new Date().toISOString(),
        sender: currentUser,
      };
      setMessages((prev) => [...prev, newMessage]);
      setChatMessage("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    } finally {
      setIsSending(false);
    }
  };

  const agent = dispute.chatInfo?.agentDetails;
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("vi-VN");
  const DISPUTE_TYPES_MAP = {
    incorrect_login: "Sai thông tin đăng nhập",
    account_banned: "Tài khoản bị khóa/hạn chế",
    wrong_description: "Sản phẩm không đúng mô tả",
    account_retrieved: "Tài khoản bị chủ cũ lấy lại",
    other: "Lý do khác",
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
        <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-themed flex-shrink-0">
            <h3 className="font-heading text-xl font-bold text-primary">
              Chi tiết Khiếu nại #{dispute.id}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Cột trái: Thông tin khiếu nại */}
            <div className="w-1/2 p-6 overflow-y-auto space-y-6 border-r border-themed">
              <div className="bg-background/50 p-4 rounded-lg border border-themed space-y-3">
                <h4 className="text-base font-semibold text-primary mb-2">
                  Thông tin bạn đã gửi
                </h4>
                <div className="flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 mr-3 text-secondary flex-shrink-0" />
                  <span className="text-secondary mr-2">Loại sự cố:</span>
                  <span className="font-semibold text-primary">
                    {DISPUTE_TYPES_MAP[dispute.dispute_type] ||
                      dispute.dispute_type}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-secondary flex-shrink-0" />
                  <span className="text-secondary mr-2">Ngày gửi:</span>
                  <span className="font-semibold text-primary">
                    {formatDate(dispute.created_at)}
                  </span>
                </div>
                <div className="flex items-start text-sm pt-3 border-t border-themed">
                  <FileText className="h-4 w-4 mr-3 mt-0.5 text-secondary flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-secondary mr-2">Mô tả chi tiết:</span>
                    <p className="font-semibold text-primary whitespace-pre-wrap mt-1">
                      {dispute.description}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-primary mb-3">
                  Bằng chứng đính kèm
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {dispute.attachments?.length > 0 ? (
                    dispute.attachments.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setLightboxUrl(url)}
                        className="block relative group aspect-square border border-themed rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {[".mp4", ".webm", ".mov"].some((ext) =>
                          url.toLowerCase().endsWith(ext)
                        ) ? (
                          <>
                            <video
                              muted
                              className="w-full h-full object-cover pointer-events-none"
                            >
                              <source src={url} />
                            </video>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <img
                              src={url}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageIcon className="h-6 w-6 text-white" />
                            </div>
                          </>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="col-span-full text-sm text-secondary">
                      Không có tệp đính kèm.
                    </p>
                  )}
                </div>
              </div>

              {dispute.resolution && (
                <div>
                  <h4 className="text-base font-semibold text-primary mb-3">
                    Phản hồi từ Admin
                  </h4>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center border border-themed">
                      <Shield className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-background/80 p-3 rounded-lg border border-themed">
                        <p className="text-sm text-secondary whitespace-pre-wrap">
                          {dispute.resolution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Chat */}
            <div className="w-1/2 flex flex-col bg-background/30">
              <div className="p-4 border-b border-themed flex-shrink-0">
                <h4 className="font-semibold text-primary">
                  Trao đổi với nhân viên hỗ trợ
                </h4>
                {agent ? (
                  <p className="text-xs text-secondary">
                    Bạn đang chat với{" "}
                    <span className="font-bold">{agent.username}</span>
                  </p>
                ) : (
                  <p className="text-xs text-secondary">
                    Đang chờ nhân viên tham gia...
                  </p>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === currentUser.id;
                  const sender = isOwnMessage ? currentUser : agent;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${
                        isOwnMessage ? "justify-end" : ""
                      }`}
                    >
                      {!isOwnMessage && (
                        <img
                          src={sender?.avatar_url}
                          alt="agent"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg max-w-[80%] ${
                          isOwnMessage ? "bg-accent text-white" : "bg-input"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      {isOwnMessage && (
                        <img
                          src={sender?.avatar_url}
                          alt="user"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-themed bg-background/50 flex-shrink-0">
                <form
                  onSubmit={handleChatSubmit}
                  className="flex items-start gap-3"
                >
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }
                    }}
                    rows="1"
                    className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover placeholder-theme resize-none"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button
                    type="submit"
                    className="action-button action-button-primary !w-auto !rounded-lg !p-3"
                    disabled={!chatMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {lightboxUrl && (
        <MediaLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
};

// =====================================================================
// COMPONENT TRANG CHÍNH
// =====================================================================
export default function DisputeHistoryPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isViewingDetail, setIsViewingDetail] = useState(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/disputes");
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
    if (isViewingDetail) return;

    setIsViewingDetail(disputeId);
    try {
      const response = await api.post(`/disputes/${disputeId}/chat`);
      const chatInfo = response.data.data;
      const fullDisputeData = disputes.find((d) => d.id === disputeId);

      setSelectedDispute({
        ...fullDisputeData,
        chatInfo: chatInfo,
      });
    } catch (err) {
      console.error("Không thể lấy hoặc tạo phòng chat:", err);
      setError("Lỗi khi mở chi tiết khiếu nại. Vui lòng thử lại.");
    } finally {
      setIsViewingDetail(null);
    }
  };

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

  const DISPUTE_TYPES_MAP = {
    incorrect_login: "Sai thông tin đăng nhập",
    account_banned: "Tài khoản bị khóa/hạn chế",
    wrong_description: "Sản phẩm không đúng mô tả",
    account_retrieved: "Tài khoản bị chủ cũ lấy lại",
    other: "Lý do khác",
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
        text: "Hoàn thành",
        icon: <CheckCircle className="h-4 w-4" />,
        className: "text-green-500 bg-green-500/10",
      },
      3: {
        text: "Không chấp nhận",
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
        {current.icon} {current.text}
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
                className="action-button action-button-secondary !w-auto !py-2 !px-4 !text-sm flex-shrink-0 flex items-center"
                disabled={isViewingDetail === dispute.id}
              >
                {isViewingDetail === dispute.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
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
          onClose={() => setSelectedDispute(null)}
        />
      )}
    </section>
  );
}
