// src/pages/AgentDashboard/ChatList.jsx
import React from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";
import { MessageCircle, Clock, User } from "lucide-react";

const ChatListSkeleton = () => (
  <div className="p-2 sm:p-4 space-y-3">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-3 p-3 rounded-xl animate-pulse"
      >
        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"></div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-lg w-20 sm:w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-8 sm:w-12"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24 sm:w-32"></div>
        </div>
      </div>
    ))}
  </div>
);

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 168) {
    // 7 days
    return date.toLocaleDateString("vi-VN", { weekday: "short" });
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

export default function ChatList() {
  const { chatList, activeChatId, selectChat, isListLoading } = useAgentChat();

  if (isListLoading) {
    return (
      <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        {/* Header Skeleton */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded w-24 sm:w-32 animate-pulse"></div>
          </div>
        </div>
        <ChatListSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
              Trò chuyện
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chatList.length} cuộc hội thoại
            </p>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto flex-grow custom-scrollbar">
        {chatList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
              Chưa có cuộc trò chuyện nào
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">
              Các tin nhắn mới sẽ hiển thị tại đây
            </p>
          </div>
        ) : (
          <div className="p-1 sm:p-2 space-y-1">
            {chatList.map((chat) => (
              <div
                key={chat.roomId}
                onClick={() => selectChat(chat.roomId)}
                className={`group p-2 sm:p-3 cursor-pointer transition-all duration-200 rounded-xl border-2 ${
                  chat.roomId === activeChatId
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-600 shadow-md transform scale-[1.02]"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Avatar with online status */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        chat.customerAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          chat.customerName
                        )}&background=4f46e5&color=ffffff&bold=true&size=48`
                      }
                      alt="Avatar"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                    />
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                  </div>

                  {/* Chat info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {chat.customerName}
                      </h3>
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                        {chat.lastMessageTime && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(chat.lastMessageTime)}</span>
                          </div>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-4 min-w-[1rem] sm:h-5 sm:min-w-[1.25rem] px-1 flex items-center justify-center shadow-lg animate-pulse">
                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate flex-1 mr-2">
                        {chat.lastMessage || "Chưa có tin nhắn"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Typing indicator (if needed) */}
                {chat.isTyping && (
                  <div className="flex items-center space-x-2 mt-2 pl-12 sm:pl-15">
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 2px;
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
      `}</style>
    </div>
  );
}
