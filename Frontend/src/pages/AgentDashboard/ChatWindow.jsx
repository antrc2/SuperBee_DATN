import React, { useState, useRef, useEffect } from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";

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
      <div className="w-2/3 flex items-center justify-center bg-gray-50 p-6 rounded-lg shadow-inner">
        <p className="text-xl text-gray-500 font-medium">
          <span className="mr-2">✨</span>Chọn một cuộc trò chuyện để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col bg-white rounded-lg shadow-lg">
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_id == refToken.current?.user_id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 mb-4 max-w-[85%] ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* <img
                src={
                  msg.sender_avatar ||
                  "https://placehold.co/40x40/cbd5e0/475569?text=User"
                }
                alt={`${msg.sender_name || "Người dùng"} Avatar`}
                className="w-9 h-9 rounded-full object-cover shadow-sm"
              /> */}
              <div
                className={`p-4 rounded-xl shadow-md relative ${
                  isOwnMessage
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="font-semibold text-sm mb-1">
                  {isOwnMessage ? "Bạn" : `${msg.sender_name || "Khách hàng"}`}
                </p>
                <p className="text-base leading-relaxed">{msg.content}</p>
                <span
                  className={`block text-xs mt-2 ${
                    isOwnMessage ? "text-blue-200" : "text-gray-500"
                  } text-right`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <textarea
            className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-400 shadow-sm"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows="1"
            style={{ maxHeight: "100px" }}
          />
          <button
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md transform active:scale-95"
            onClick={handleSendMessage}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
