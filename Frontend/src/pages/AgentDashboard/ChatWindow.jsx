// src/pages/AgentDashboard/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";
import { Send } from "lucide-react";

// Component con cho trạng thái chờ (loading skeleton)
const MessagesSkeleton = () => (
  <div className="flex-1 p-6 space-y-6 animate-pulse">
    <div className="flex justify-start">
      <div className="h-10 bg-gray-200 rounded-lg w-2/3"></div>
    </div>
    <div className="flex justify-end">
      <div className="h-10 bg-blue-200 rounded-lg w-1/2"></div>
    </div>
    <div className="flex justify-start">
      <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
    </div>
  </div>
);

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
  const messagesEndRef = useRef(null);

  const activeChatInfo = activeChatId
    ? chatList.find((chat) => chat.roomId === activeChatId)
    : null;

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
      <div className="w-full flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500">
          Vui lòng chọn một cuộc trò chuyện để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <h3 className="font-semibold text-lg text-gray-800">
          Trò chuyện với {activeChatInfo?.customerName || "Khách hàng"}
        </h3>
      </div>

      {/* Messages */}
      {isLoading ? (
        <MessagesSkeleton />
      ) : (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-lg ${
                    isOwnMessage
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <input
            className="flex-1 p-3 bg-gray-100 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
