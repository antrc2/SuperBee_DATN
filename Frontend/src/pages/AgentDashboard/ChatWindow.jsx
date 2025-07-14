import React, { useState, useRef, useEffect } from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function ChatWindow() {
  const { messages, activeChatId, sendMessage, refToken } = useAgentChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  if (!activeChatId) {
    return (
      <div className="w-full sm:w-2/3 md:w-3/4 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">
            Bắt đầu cuộc trò chuyện
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Chọn một khách hàng từ danh sách bên trái.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-2/3 md:w-3/4 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
        <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">
          Trò chuyện với {messages[0]?.sender_name || "Khách hàng"}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white dark:bg-gray-900">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_id == refToken.current?.user_id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 max-w-xl ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`p-3 rounded-2xl ${
                  isOwnMessage
                    ? "bg-blue-600 text-white rounded-br-lg"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-lg"
                }`}
              >
                <p className="text-base">{msg.content}</p>
                <p
                  className={`text-xs mt-2 text-right ${
                    isOwnMessage
                      ? "text-blue-200"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <textarea
            className="flex-1 p-3 bg-gray-200 dark:bg-gray-800 border-transparent rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Nhập tin nhắn của bạn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows="1"
          />
          <button
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
