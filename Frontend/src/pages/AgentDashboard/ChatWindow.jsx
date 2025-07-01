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
      <div className="w-2/3 flex items-center justify-center text-gray-500">
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col">
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        {messages.map((msg) => {
          console.log("🚀 ~ {messages.map ~ msg:", msg);
          // Xác định xem tin nhắn có phải do người dùng hiện tại gửi hay không
          const isOwnMessage = msg.sender_id == refToken.current?.user_id;
          return (
            <div
              key={msg.id} // Sử dụng ID tin nhắn làm khóa để React render danh sách
              className={`p-3 rounded-lg max-w-[80%] ${
                isOwnMessage
                  ? "bg-blue-500 text-white self-end ml-auto" // Kiểu dáng cho tin nhắn của chính mình (căn phải, màu xanh)
                  : "bg-gray-300 text-gray-800 self-start mr-auto" // Kiểu dáng cho các tin nhắn khác (căn trái, màu xám)
              }`}
            >
              <p className="font-semibold text-sm">
                {isOwnMessage ? "Bạn" : `${msg.sender_name || "khách hàng"}`}
              </p>
              <p className="text-base">{msg.content}</p>
              <span className="block text-xs mt-1 opacity-75">
                {/* Định dạng dấu thời gian tin nhắn theo giờ địa phương */}
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <textarea
            className="flex-1 p-3 border rounded-lg resize-none"
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
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            onClick={handleSendMessage}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
