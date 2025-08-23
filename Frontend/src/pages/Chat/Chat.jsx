// src/pages/Chat/Chat.jsx
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { Send, MessageCircleWarning, X, ArrowDown } from "lucide-react";

const ChatComponent = ({ onClose }) => {
  const {
    isLoggedIn,
    user,
    agentChatRoom,
    isLoading,
    error,
    sendChatMessage,
    requestAgentChat,
    unreadCount,
    markChatAsRead,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentChatRoom?.messages]);

  // Đánh dấu đã đọc khi mở cửa sổ chat
  useEffect(() => {
    if (agentChatRoom?.roomId) {
      markChatAsRead();
    }
  }, [agentChatRoom?.roomId, markChatAsRead]);

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && agentChatRoom?.roomId) {
      sendChatMessage(trimmedMessage);
      setNewMessage("");
    }
  };

  /**
   * Yêu cầu 1: Giao diện khi chưa đăng nhập
   */
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 bg-gray-50 rounded-2xl">
        <MessageCircleWarning className="w-16 h-16 text-blue-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          Tính năng Chat
        </h3>
        <p className="text-gray-600 text-center">
          Vui lòng đăng nhập để có thể trò chuyện cùng nhân viên hỗ trợ của
          chúng tôi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {agentChatRoom?.agentDetails ? (
            <>
              <img
                src={agentChatRoom.agentDetails.avatar_url}
                alt="Agent Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-800">
                  {agentChatRoom.agentDetails.username}
                </p>
                <p className="text-xs text-green-600">Đang hoạt động</p>
              </div>
            </>
          ) : (
            <p className="font-bold text-gray-800">Hỗ trợ trực tuyến</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Khung tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {agentChatRoom?.messages?.map((msg) => {
          const isOwnMessage = msg.sender_id === user.id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 my-2 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md ${
                  isOwnMessage
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input và Nút yêu cầu chat */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {agentChatRoom?.roomId ? (
          // Yêu cầu 3: Giao diện gửi tin nhắn
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
              disabled={!newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        ) : (
          // Yêu cầu 2: Giao diện bắt đầu chat
          <div className="text-center">
            <button
              onClick={() => requestAgentChat("support")}
              className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading
                ? "Đang tìm nhân viên..."
                : "Bắt đầu trò chuyện với nhân viên hỗ trợ"}
            </button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
