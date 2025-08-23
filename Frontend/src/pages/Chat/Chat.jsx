// src/pages/Chat/Chat.jsx - Improved Responsive Version
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

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentChatRoom?.messages]);

  // Mark as read when chat opens
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Enhanced UI when not logged in - Mobile optimized
   */
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-2xl min-h-[400px] sm:min-h-[500px]">
        <MessageCircleWarning className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">
          Tính năng Chat
        </h3>
        <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed max-w-sm">
          Vui lòng đăng nhập để có thể trò chuyện cùng nhân viên hỗ trợ của
          chúng tôi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] sm:min-h-[500px] max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Enhanced Header with mobile optimization */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-100 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {agentChatRoom?.agentDetails ? (
            <>
              <img
                src={agentChatRoom.agentDetails.avatar_url}
                alt="Agent Avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 text-sm sm:text-base truncate">
                  {agentChatRoom.agentDetails.username}
                </p>
                <p className="text-xs text-green-600">Đang hoạt động</p>
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                Hỗ trợ trực tuyến
              </p>
              <p className="text-xs text-green-600">Sẵn sàng hỗ trợ</p>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Đóng chat"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      </div>

      {/* Enhanced Messages container with better mobile scrolling */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 space-y-2 sm:space-y-3">
        {agentChatRoom?.messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-sm mx-auto">
              <p className="text-sm sm:text-base mb-2">Chào mừng bạn!</p>
              <p className="text-xs sm:text-sm">
                Hãy bắt đầu cuộc trò chuyện. Chúng tôi sẵn sàng hỗ trợ bạn.
              </p>
            </div>
          </div>
        ) : (
          agentChatRoom?.messages?.map((msg) => {
            const isOwnMessage = msg.sender_id === user.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwnMessage && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex-shrink-0 mb-1">
                    {agentChatRoom?.agentDetails?.avatar_url ? (
                      <img
                        src={agentChatRoom.agentDetails.avatar_url}
                        alt="Agent"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl max-w-[75%] sm:max-w-xs md:max-w-sm break-words ${
                    isOwnMessage
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {isOwnMessage && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex-shrink-0 mb-1 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input area with better mobile experience */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
        {agentChatRoom?.roomId ? (
          /* Enhanced message input with mobile optimization */
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                rows={1}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base min-h-[44px] max-h-[120px] overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                }}
                onInput={(e) => {
                  // Auto resize textarea
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              {newMessage.length > 0 && (
                <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                  {newMessage.length}/1000
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              className="p-2 sm:p-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:bg-blue-600 disabled:hover:bg-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              disabled={!newMessage.trim() || isLoading}
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        ) : (
          /* Enhanced start chat button with mobile optimization */
          <div className="text-center space-y-3">
            <button
              onClick={() => requestAgentChat("support")}
              className="w-full px-4 py-3 sm:py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base min-h-[44px] disabled:hover:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading
                ? "Đang tìm nhân viên..."
                : "Bắt đầu trò chuyện với nhân viên hỗ trợ"}
            </button>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-xs sm:text-sm text-center">
                  {error}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center">
              Thời gian phản hồi trung bình: 2-5 phút
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
