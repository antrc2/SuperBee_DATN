// src/pages/AgentDashboard/ChatList.jsx
import React from "react";
import { useAgentChat } from "../../contexts/AgentChatContext";

export default function ChatList() {
  // [THAY ĐỔI] Chỉ dùng context của Agent
  const { chatList, activeChatId, selectChat } = useAgentChat();

  // [THAY ĐỔI] Xóa bỏ useEffect và useChat không cần thiết

  return (
    <div className="w-1/3 border-r border-gray-300 bg-gray-50 overflow-y-auto">
      <h2 className="p-4 text-xl font-bold border-b">Cuộc trò chuyện</h2>
      <ul>
        {chatList.map((chat) => (
          <li
            key={chat.roomId}
            onClick={() => selectChat(chat.roomId)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-200 ${
              chat.roomId === activeChatId ? "bg-blue-100" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              {/* [THAY ĐỔI] Hiển thị customerId cho đúng */}
              <p className="font-semibold">Khách: {chat.customerId}</p>
              {chat.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm truncate">{chat.lastMessage}</p>
          </li>
        ))}
        {chatList.length === 0 && (
          <p className="p-4 text-gray-500">Chưa có cuộc trò chuyện nào.</p>
        )}
      </ul>
    </div>
  );
}
