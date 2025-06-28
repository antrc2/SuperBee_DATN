// src/pages/AgentDashboard/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAgentChat } from "./AgentChatContext";
import { useAuth } from "@contexts/AuthContext";

export default function ChatWindow() {
  const { messages, activeChatId, sendMessage } = useAgentChat();
  const { user } = useAuth();
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg max-w-[80%] ${
              msg.senderId === user.id
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white text-gray-800 self-start mr-auto shadow"
            }`}
          >
            <p>{msg.content}</p>
            <span className="block text-xs mt-1 opacity-75">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
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
