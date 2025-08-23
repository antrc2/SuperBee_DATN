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
    <div className="bg-white shadow-sm rounded-lg border h-full flex flex-col max-h-[75vh]">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Trao đổi với {customer?.username || "khách hàng"}
        </h3>
      </div>

      {/* Body - Tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.sender_id === currentUser?.id;
              const sender = isOwnMessage ? currentUser : customer;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isOwnMessage ? "justify-end" : ""
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      src={sender?.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[80%] ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {isOwnMessage && (
                    <img
                      src={sender?.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
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
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
