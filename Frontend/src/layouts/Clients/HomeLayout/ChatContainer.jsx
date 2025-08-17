// File: src/components/Client/layout/ChatContainer.jsx (Component mới)
import React, { useState, useEffect } from "react";
import ChatComponent from "../../../pages/Chat/Chat"; // Giả sử đường dẫn đúng
import ChatWidget from "../../../pages/Clients/Chatbot/ChatWidget"; // Giả sử đường dẫn đúng
import { useChat } from "../../../contexts/ChatContext";
import { MessageSquareText, X, Bot, ArrowUp } from "lucide-react"; // Thêm Bot icon cho AI

const ChatContainer = ({ showScrollTop, scrollToTop }) => {
  const [isStaffChatOpen, setIsStaffChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const {
    isLoggedIn,
    requestAgentChat,
    agentChatRoom,
    markChatAsRead,
    unreadCount,
  } = useChat();

  const toggleStaffChat = async () => {
    if (!isStaffChatOpen) {
      if (isLoggedIn && !agentChatRoom) {
        await requestAgentChat();
      }
      markChatAsRead();
    }
    setIsStaffChatOpen(!isStaffChatOpen);
  };

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
  };

  // Logic vị trí song song: AI ở bên trái, Staff ở bên phải khi cả hai mở
  const getAIChatPosition = () => {
    if (isStaffChatOpen && isAIChatOpen) {
      return "bottom-[120px] right-[420px]"; // Di chuyển AI sang trái
    }
    return "bottom-[120px] right-0"; // Mặc định right
  };

  const getStaffChatPosition = () => {
    return "bottom-[120px] right-0"; // Staff luôn ở right
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end gap-4">
      {/* Popup Chat AI */}
      {isAIChatOpen && (
        <div
          className={`absolute w-[600px] min-w-[400px] max-w-[800px]  animate-fade-in-up z-50 shadow-2xl rounded-3xl overflow-hidden border border-themed ${getAIChatPosition()}`}
        >
          <div className="bg-input border-themed flex flex-col h-full  ">
            {/* Header cho AI Chat (giống Facebook: tiêu đề, nút đóng) */}
            <div className="flex items-center justify-between py-5 px-4 bg-gradient-header border-b border-themed">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-accent">
                  <img
                    src="https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/13Bee.png"
                    alt="13Bee Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-heading font-bold text-md text-primary">
                    Trợ lý AI 13Bee
                  </span>
                  <div className="text-xs text-secondary font-heading">
                    Đang trực tuyến
                  </div>
                </div>
              </div>
              <button
                onClick={toggleAIChat}
                className="p-2 rounded-full text-secondary hover:text-primary hover:bg-same transition-all duration-200"
                aria-label="Đóng chat AI"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Nội dung chat AI */}
            <ChatWidget />
          </div>
        </div>
      )}

      {/* Popup Chat Nhân viên */}
      {isStaffChatOpen && (
        <div
          className={`absolute w-[400px] min-w-[320px] max-w-[500px] min-h-[500px] max-h-[80vh] animate-fade-in-up z-50 shadow-2xl rounded-3xl overflow-hidden border border-themed ${getStaffChatPosition()}`}
        >
          <ChatComponent
            agent={agentChatRoom?.agentDetails}
            onClose={toggleStaffChat}
          />
        </div>
      )}

      {/* Nút Scroll to Top (giữ nguyên nhưng tích hợp vào container) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 text-white shadow-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Các nút đóng/mở song song ngang cho đẹp (giống Facebook tabs) */}
      <div className="flex items-center gap-3">
        {/* Nút Chat AI */}
        <button
          onClick={toggleAIChat}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
            isAIChatOpen
              ? "bg-blue-700 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          aria-label={isAIChatOpen ? "Đóng chat AI" : "Mở chat AI"}
        >
          {isAIChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6" /> // Icon cho AI
          )}
          {isAIChatOpen && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
          )}
        </button>

        {/* Nút Chat Nhân viên */}
        <button
          onClick={toggleStaffChat}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
            isStaffChatOpen
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              : "bg-gradient-button text-accent-contrast"
          }`}
          aria-label={
            isStaffChatOpen ? "Đóng chat nhân viên" : "Mở chat nhân viên"
          }
        >
          {isStaffChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquareText className="w-6 h-6" />
          )}
          {!isStaffChatOpen && unreadCount.current > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-danger text-xs text-white font-bold animate-pulse shadow-md">
              {unreadCount.current > 9 ? "9+" : unreadCount.current}
            </span>
          )}
          {isStaffChatOpen && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
