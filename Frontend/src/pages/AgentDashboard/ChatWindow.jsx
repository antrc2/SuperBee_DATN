// src/pages/AgentDashboard/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  User,
  MessageCircle,
} from "lucide-react";

// Component skeleton cho loading messages
const MessagesSkeleton = () => (
  <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
      >
        <div
          className={`flex items-end space-x-2 max-w-xs ${
            i % 2 === 0 ? "" : "flex-row-reverse space-x-reverse"
          }`}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
          <div
            className={`p-2 sm:p-3 rounded-2xl ${
              i % 2 === 0
                ? "bg-gray-200 dark:bg-gray-600"
                : "bg-blue-200 dark:bg-blue-700"
            }`}
          >
            <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-500 rounded w-20 sm:w-24 mb-1"></div>
            <div className="h-2 sm:h-3 bg-gray-300 dark:bg-gray-500 rounded w-12 sm:w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Component hiển thị thời gian
const MessageTime = ({ timestamp }) => {
  const formatTime = (time) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
      {formatTime(timestamp)}
    </span>
  );
};

export default function ChatWindow() {
  const {
    messages,
    activeChatId,
    sendMessage,
    currentUser,
    isLoading,
    chatList,
  } = useAgentChat();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const activeChatInfo = activeChatId
    ? chatList.find((chat) => chat.roomId === activeChatId)
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeChatId) {
      inputRef.current?.focus();
    }
  }, [activeChatId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage("");
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Simulate typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  // Trạng thái khi chưa chọn chat
  if (!activeChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">
            Chào mừng đến với Admin Chat
          </h3>
          <p className="text-gray-500 leading-relaxed">
            Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ
            khách hàng. Tất cả tin nhắn sẽ được hiển thị tại đây.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mt-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Sẵn sàng hỗ trợ</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={
                  activeChatInfo?.customerAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    activeChatInfo?.customerName || "User"
                  )}&background=4f46e5&color=ffffff&bold=true&size=40`
                }
                alt="Avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                {activeChatInfo?.customerName || "Khách hàng"}
              </h3>
              <p className="text-xs text-green-500 dark:text-green-400 font-medium">
                Đang hoạt động
              </p>
            </div>
          </div>

          {/* <div className="flex items-center space-x-1 sm:space-x-2">
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div> */}
        </div>
      </div>

      {/* Messages Container */}
      {isLoading ? (
        <MessagesSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-700/50 dark:to-gray-800">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
                  Cuộc trò chuyện mới
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">
                  Gửi tin nhắn đầu tiên để bắt đầu
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwnMessage = msg.sender_id === currentUser.id;
                const prevMsg = messages[index - 1];
                const showAvatar =
                  !prevMsg || prevMsg.sender_id !== msg.sender_id;
                const isLastInGroup =
                  !messages[index + 1] ||
                  messages[index + 1].sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-end gap-2 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar cho tin nhắn của khách hàng */}
                    {!isOwnMessage && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        {showAvatar && (
                          <img
                            src={
                              activeChatInfo?.customerAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                activeChatInfo?.customerName || "User"
                              )}&background=e5e7eb&color=6b7280&size=32`
                            }
                            alt="Avatar"
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div className="flex flex-col max-w-xs sm:max-w-md lg:max-w-lg">
                      <div
                        className={`relative px-3 py-2 sm:px-4 sm:py-2 ${
                          isOwnMessage
                            ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white ${
                                isLastInGroup
                                  ? "rounded-2xl rounded-br-md"
                                  : "rounded-2xl rounded-br-md"
                              }`
                            : `bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm ${
                                isLastInGroup
                                  ? "rounded-2xl rounded-bl-md"
                                  : "rounded-2xl rounded-bl-md"
                              }`
                        } transition-all duration-200 hover:shadow-md`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {msg.content}
                        </p>
                      </div>

                      {/* Message time - always visible */}
                      <div
                        className={`flex items-center mt-1 ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <MessageTime timestamp={msg.created_at} />
                        {isOwnMessage && (
                          <div className="flex space-x-1 ml-2">
                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full opacity-60"></div>
                            <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Avatar cho tin nhắn của admin */}
                    {isOwnMessage && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        {showAvatar && (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-3 sm:px-4 py-2">
          <div className="flex items-center space-x-2">
            <img
              src={
                activeChatInfo?.customerAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  activeChatInfo?.customerName || "User"
                )}&background=e5e7eb&color=6b7280&size=24`
              }
              alt="Avatar"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
            />
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              đang nhập...
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2 sm:space-x-3">
          {/* Attachment button */}
          {/* <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button> */}

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200 text-sm sm:text-base"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              style={{
                minHeight: "40px",
                maxHeight: "120px",
              }}
            />

            {/* Emoji button */}
            {/* <button className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button> */}
          </div>

          {/* Send button */}
          <button
            className={`p-2.5 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
              newMessage.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        textarea {
          field-sizing: content;
        }

        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
        }
      `}</style>
    </div>
  );
}
