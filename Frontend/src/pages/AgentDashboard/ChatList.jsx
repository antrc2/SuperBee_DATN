// src/pages/AgentDashboard/ChatList.jsx
import React from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";

const ChatListSkeleton = () => (
  <div className="p-3 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-2">
        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ChatList() {
  const { chatList, activeChatId, selectChat, isListLoading } = useAgentChat();

  if (isListLoading) {
    return (
      <div className="w-full sm:w-1/3 md:w-1/4 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Trò chuyện</h2>
        </div>
        <ChatListSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full sm:w-1/3 md:w-1/4 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800">Trò chuyện</h2>
      </div>
      <ul className="overflow-y-auto flex-grow">
        {chatList.length === 0 ? (
          <p className="p-6 text-center text-gray-500 italic">
            Không có cuộc trò chuyện nào.
          </p>
        ) : (
          chatList.map((chat) => (
            <li
              key={chat.roomId}
              onClick={() => selectChat(chat.roomId)}
              className={`p-3 cursor-pointer transition-colors flex items-center space-x-3 border-l-4 ${
                chat.roomId === activeChatId
                  ? "bg-blue-50 border-blue-500"
                  : "border-transparent hover:bg-gray-100"
              }`}
            >
              <img
                src={
                  chat.customerAvatar ||
                  `https://ui-avatars.com/api/?name=${chat.customerName}`
                }
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800 truncate">
                    {chat.customerName}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm truncate">
                  {chat.lastMessage}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
