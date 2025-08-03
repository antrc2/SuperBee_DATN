import { useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { Send, MessageCircleWarning, X, ArrowDown } from "lucide-react"; // Thay đổi: ArrowUp -> ArrowDown

const ChatComponent = ({ agent, onClose }) => {
  // Nhận props agent và hàm onClose
  const {
    isLoggedIn,
    agentChatRoom,
    sendChatMessage,
    requestAgentChat,
    refToken,
    unreadCount,
  } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref cho khu vực tin nhắn để theo dõi cuộn
  const isAtBottomRef = useRef(true); // Ref để theo dõi vị trí cuộn

  // --- STATE VÀ LOGIC CHO NÚT CUỘN XUỐNG DƯỚI ---
  const [showScrollBottom, setShowScrollBottom] = useState(false); // Thay đổi: Đổi tên state

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Kiểm tra nếu người dùng không ở cuối (với một khoảng đệm nhỏ)
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollBottom(!isScrolledToBottom);
      isAtBottomRef.current = isScrolledToBottom; // Cập nhật trạng thái cuộn
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // -------------------------------------------

  useEffect(() => {
    setLocalMessages(agentChatRoom?.messages || []);
  }, [agentChatRoom?.messages]);

  // useEffect tự động cuộn xuống thông minh hơn
  useEffect(() => {
    if (isAtBottomRef.current) {
      // Chỉ tự động cuộn nếu người dùng đang ở cuối
      scrollToBottom();
    }
  }, [localMessages]); // Chạy mỗi khi có tin nhắn mới

  if (!isLoggedIn) {
    // ... (Giữ nguyên phần giao diện khi chưa đăng nhập)
    return (
      <div className="flex flex-col min-h-[30rem] max-h-[45rem] bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-xl border border-gray-200">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100">
            <div className="mb-5 text-blue-500">
              <svg
                className="mx-auto h-20 w-20 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-8 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.418-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
              Chức năng Chat
            </h3>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Bạn cần đăng nhập để sử dụng tính năng chat với nhân viên hỗ trợ.
            </p>
            <p className="text-sm text-gray-400 italic">
              Tuy nhiên, bạn vẫn có thể nhận thông báo chung từ hệ thống.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && agentChatRoom?.roomId) {
      const tempMessage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        sender_id: refToken.current?.user_id,
        sender_name: "Bạn",
        sender_avatar:
          refToken.current?.avatar_url ||
          "https://placehold.co/40x40/cbd5e0/475569?text=You",
        content: trimmedMessage,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prevMessages) => [...prevMessages, tempMessage]);
      setNewMessage("");
      unreadCount.current = 0;
      const success = sendChatMessage(trimmedMessage);
      if (!success) {
        console.error("Không thể gửi tin nhắn ngay lập tức do sự cố nội bộ.");
      }
    }
  };
  return (
    <div className="flex flex-col h-full max-h-[600px] bg-dropdown border border-themed rounded-2xl shadow-2xl overflow-hidden">
      {/* ... (Giữ nguyên Header của Chat) */}
      <div className="flex items-center justify-between p-4 bg-content-bg border-b border-themed flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={agent?.agentAvatar ?? agent?.avatar_url}
            alt="Agent Avatar"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/50"
          />
          <div>
            <p className="font-bold text-lg text-primary">
              {agent?.agentName ?? agent?.username}
            </p>
            {agent?.average_rating && (
              <p className="text-xs text-secondary">
                ⭐ {agent?.average_rating} ({agent?.total_ratings_count} đánh
                giá)
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Khiếu nại"
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <MessageCircleWarning className="w-5 h-5" />
          </button>
          <button
            title="Đóng"
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Khu vực hiển thị tin nhắn */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 bg-background p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar relative min-h-[300px]"
      >
        {localMessages.map((msg, index) => {
          const isOwnMessage = msg.sender_id == refToken.current?.user_id;
          return (
            <div
              key={msg.id || index}
              className={`flex items-end gap-2.5 max-w-[85%] ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-md ${
                  isOwnMessage
                    ? "bg-gradient-button text-accent-contrast rounded-br-none"
                    : "bg-content-bg text-primary rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />

        {/* Thay đổi: Nút cuộn xuống dưới */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            title="Cuộn xuống tin nhắn mới nhất"
            className="sticky bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-accent/80 backdrop-blur-sm text-accent-contrast flex items-center justify-center shadow-lg animate-fade-in"
          >
            <ArrowDown className="w-6 h-6" />
            {unreadCount.current > 0 ? unreadCount.current : ""}
          </button>
        )}
      </div>

      {/* ... (Giữ nguyên khu vực nhập tin nhắn) */}
      {agentChatRoom?.roomId ? (
        <div className="flex items-center p-3 bg-content-bg border-t border-themed flex-shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-3 bg-input text-input border-themed rounded-xl focus:outline-none border-hover placeholder-theme"
            onKeyPress={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSendMessage())
            }
          />
          <button
            onClick={handleSendMessage}
            className="action-button action-button-primary !w-auto ml-2 !px-5 !py-3"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="p-4">
          <button
            onClick={requestAgentChat}
            className="action-button action-button-primary"
          >
            Yêu cầu Chat với Nhân viên ✨
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
