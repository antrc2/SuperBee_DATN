// src/pages/AgentDashboard/ChatList.jsx
import React from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";

export default function ChatList() {
  const { chatList, activeChatId, selectChat } = useAgentChat();

  return (
    <div className="w-full sm:w-1/3 md:w-1/4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          Trò chuyện
        </h2>
      </div>
      <ul className="overflow-y-auto flex-grow">
        {chatList.map((chat) => (
          <li
            key={chat.roomId}
            onClick={() => selectChat(chat.roomId)}
            className={`p-3 cursor-pointer transition-all duration-200 ease-in-out flex items-center space-x-4 border-l-4 ${
              chat.roomId === activeChatId
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50"
            }`}
          >
            <div className="relative">
              <img
                src={
                  chat.customerAvatar ||
                  `https://ui-avatars.com/api/?name=${
                    chat.customerName || chat.customerId
                  }&background=e2e8f0&color=64748b`
                }
                alt="Customer Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {chat.customerName || `Khách: ${chat.customerId}`}
                </p>
                {chat.unreadMessageCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    {chat.unreadMessageCount}
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                {chat.lastMessage || "Chưa có tin nhắn nào..."}
              </p>
            </div>
          </li>
        ))}
        {chatList.length === 0 && (
          <div className="p-6 text-center h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 italic">
              Không có cuộc trò chuyện nào.
            </p>
          </div>
        )}
      </ul>
    </div>
  );
}
