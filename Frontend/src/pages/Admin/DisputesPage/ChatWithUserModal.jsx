// src/pages/Admin/Disputes/IntegratedChat.jsx

import React, { useEffect, useState, useRef } from "react";
import { useDisputeChat } from "@contexts/DisputeChatContext";
import { Send, Loader2 } from "lucide-react";

export default function IntegratedChat({ disputeId, customer }) {
  const {
    messages,
    isLoading,
    fetchDisputeChat,
    sendDisputeMessage,
    currentUser,
  } = useDisputeChat();

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (disputeId) {
      fetchDisputeChat(disputeId);
    }
  }, [disputeId, fetchDisputeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendDisputeMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    // Sử dụng component Card để đồng bộ
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full max-h-[75vh]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Trao đổi với {customer?.username || "khách hàng"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ID Khiếu nại: #{disputeId}
        </p>
      </div>

      {/* Body - Tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.sender_id === currentUser?.id;
              // Mặc định người gửi là customer nếu không phải tin nhắn của mình
              const sender = isOwnMessage ? currentUser : customer;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      src={
                        sender?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${
                          sender?.username || "K"
                        }&background=random`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover self-start"
                    />
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] sm:max-w-[60%] ${
                      isOwnMessage
                        ? "bg-blue-600 text-white rounded-br-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                  {isOwnMessage && (
                    <img
                      src={
                        sender?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${
                          sender?.username || "A"
                        }&background=random`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover self-start"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer - Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
