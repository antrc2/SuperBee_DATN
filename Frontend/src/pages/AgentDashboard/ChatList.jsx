// src/pages/AgentDashboard/ChatList.jsx
import React from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";

export default function ChatList() {
  const { chatList, activeChatId, selectChat } = useAgentChat();

  return (
    <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto shadow-lg rounded-l-lg">
      <h2 className="p-5 text-2xl font-extrabold text-gray-800 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        Cuộc trò chuyện
      </h2>
      <ul>
        {chatList.map((chat) => (
          <li
            key={chat.roomId}
            onClick={() => selectChat(chat.roomId)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ease-in-out ${
              chat.roomId === activeChatId
                ? "bg-blue-50 bg-opacity-80 border-blue-300 border-l-4 text-blue-800"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-4">
              <img
                src={
                  chat.customerAvatar ||
                  "https://placehold.co/48x48/e2e8f0/64748b?text=KH"
                }
                alt="Customer Avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-lg text-gray-800">
                    {chat.customerName || `Khách: ${chat.customerId}`}
                  </p>
                  {chat.unreadMessageCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-extrabold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                      {chat.unreadMessageCount}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm truncate">
                  {chat.lastMessage || "Chưa có tin nhắn nào..."}
                </p>
              </div>
            </div>
          </li>
        ))}
        {chatList.length === 0 && (
          <p className="p-6 text-gray-500 text-center italic">
            Không có cuộc trò chuyện nào hiện tại.
          </p>
        )}
      </ul>
    </div>
  );
}
