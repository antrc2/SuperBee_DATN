// File: src/components/Client/layout/ChatContainer.jsx (Improved Responsive Version)
import React, { useState, useEffect } from "react";
import ChatComponent from "../../../pages/Chat/Chat";
import ChatWidget from "../../../pages/Clients/Chatbot/ChatWidget";
import { useChat } from "../../../contexts/ChatContext";
import { MessageSquareText, X, Bot, ArrowUp } from "lucide-react";

const ChatContainer = ({ showScrollTop, scrollToTop }) => {
  const [isStaffChatOpen, setIsStaffChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const {
    isLoggedIn,
    requestAgentChat,
    agentChatRoom,
    markChatAsRead,
    unreadCount,
  } = useChat();

  // Enhanced responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-close chats on mobile when both are open (prevent overlap)
  useEffect(() => {
    if (isMobile && isStaffChatOpen && isAIChatOpen) {
      // Keep only the most recently opened one
      // You could implement logic to track which was opened last
      setIsStaffChatOpen(false);
    }
  }, [isMobile, isStaffChatOpen, isAIChatOpen]);

  const toggleStaffChat = () => {
    setIsStaffChatOpen(!isStaffChatOpen);
    if (isMobile && isAIChatOpen) {
      setIsAIChatOpen(false);
    }
  };

  const toggleAIChat = () => {
    setIsAIChatOpen(!isAIChatOpen);
    if (isMobile && isStaffChatOpen) {
      setIsStaffChatOpen(false);
    }
  };

  // Enhanced positioning logic with full responsive support
  const getChatPositioning = () => {
    const baseClasses =
      "fixed z-50 shadow-2xl rounded-3xl overflow-hidden border border-themed animate-fade-in-up";

    if (isMobile) {
      return {
        aiChat: `${baseClasses} bottom-[120px] left-2 right-2 top-[10%] max-h-[80vh]`,
        staffChat: `${baseClasses} bottom-[120px] left-2 right-2 top-[15%] max-h-[75vh]`,
      };
    }

    if (isTablet) {
      return {
        aiChat:
          isStaffChatOpen && isAIChatOpen
            ? `${baseClasses} bottom-[120px] right-[420px] w-[380px] min-w-[300px] max-w-[450px] max-h-[70vh]`
            : `${baseClasses} bottom-[120px] right-4 w-[500px] min-w-[400px] max-w-[600px] max-h-[70vh]`,
        staffChat: `${baseClasses} bottom-[120px] right-4 w-[400px] min-w-[350px] max-w-[450px] max-h-[70vh]`,
      };
    }

    // Desktop
    return {
      aiChat:
        isStaffChatOpen && isAIChatOpen
          ? `${baseClasses} bottom-[120px] right-[440px] w-[600px] min-w-[500px] max-w-[800px] max-h-[80vh]`
          : `${baseClasses} bottom-[120px] right-4 w-[600px] min-w-[400px] max-w-[800px] max-h-[80vh]`,
      staffChat: `${baseClasses} bottom-[120px] right-4 w-[420px] min-w-[350px] max-w-[500px] max-h-[80vh]`,
    };
  };

  const positions = getChatPositioning();

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end gap-3 sm:gap-4">
      {/* AI Chat Popup with enhanced responsive design */}
      {isAIChatOpen && (
        <div className={positions.aiChat}>
          <div className="bg-input border-themed flex flex-col h-full">
            {/* Enhanced Header for AI Chat */}
            <div className="flex items-center justify-between py-3 sm:py-4 md:py-5 px-3 sm:px-4 bg-gradient-header border-b border-themed flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-accent flex-shrink-0">
                  <img
                    src="https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/13Bee.png"
                    alt="13Bee Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-heading font-bold text-sm sm:text-base md:text-lg text-primary block truncate">
                    Trợ lý AI 13Bee
                  </span>
                  <div className="text-xs sm:text-sm text-secondary font-heading">
                    Đang trực tuyến
                  </div>
                </div>
              </div>
              <button
                onClick={toggleAIChat}
                className="p-2 rounded-full text-secondary hover:text-primary hover:bg-same transition-all duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Đóng chat AI"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            {/* AI Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatWidget />
            </div>
          </div>
        </div>
      )}

      {/* Staff Chat Popup with enhanced responsive design */}
      {isStaffChatOpen && (
        <div className={positions.staffChat}>
          <ChatComponent
            agent={agentChatRoom?.agentDetails}
            onClose={toggleStaffChat}
          />
        </div>
      )}

      {/* Enhanced Scroll to Top button with better mobile positioning */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gray-700 text-white shadow-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Enhanced Control Buttons with full responsive design */}
      <div
        className={`flex gap-2 sm:gap-3 ${
          isMobile ? "flex-col-reverse" : "flex-row items-center"
        }`}
      >
        {/* AI Chat Button */}
        <div className="relative">
          <button
            onClick={toggleAIChat}
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isAIChatOpen
                ? "bg-blue-700 text-white scale-105"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label={isAIChatOpen ? "Đóng chat AI" : "Mở chat AI"}
            aria-expanded={isAIChatOpen}
          >
            {isAIChatOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            {/* Active indicator */}
            {isAIChatOpen && (
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>

          {/* Tooltip for mobile */}
          {isMobile && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100">
              {isAIChatOpen ? "Đóng AI" : "Chat AI"}
            </div>
          )}
        </div>

        {/* Staff Chat Button */}
        <div className="relative">
          <button
            onClick={toggleStaffChat}
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isStaffChatOpen
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105 focus:ring-orange-500"
                : "bg-gradient-button text-accent-contrast hover:opacity-90 focus:ring-orange-400"
            }`}
            aria-label={
              isStaffChatOpen ? "Đóng chat nhân viên" : "Mở chat nhân viên"
            }
            aria-expanded={isStaffChatOpen}
          >
            {isStaffChatOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6" />
            )}

            {/* Unread count badge */}
            {!isStaffChatOpen && unreadCount.current > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-danger text-xs text-white font-bold animate-bounce shadow-md min-w-[20px] sm:min-w-[24px]">
                {unreadCount.current > 99 ? "99+" : unreadCount.current}
              </span>
            )}

            {/* Active indicator */}
            {isStaffChatOpen && (
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>

          {/* Tooltip for mobile */}
          {isMobile && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100">
              {isStaffChatOpen ? "Đóng NV" : "Chat NV"}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-specific overlay when chat is open */}
      {isMobile && (isAIChatOpen || isStaffChatOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => {
            setIsAIChatOpen(false);
            setIsStaffChatOpen(false);
          }}
        />
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isAIChatOpen && "Chat AI đã mở"}
        {isStaffChatOpen && "Chat nhân viên đã mở"}
        {!isAIChatOpen && !isStaffChatOpen && "Tất cả chat đã đóng"}
      </div>
    </div>
  );
};

export default ChatContainer;
