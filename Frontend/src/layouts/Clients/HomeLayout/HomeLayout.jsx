import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/Client/layout/Header";
import Footer from "@components/Client/layout/Footer";
import ChatComponent from "../../../pages/Chat/Chat";
import { useChat } from "../../../contexts/ChatContext";
import { ClientThemeProvider } from "../../../contexts/ClientThemeContext";
import { MessageSquareText, X } from "lucide-react"; // Import icon
import ChatWidget from "../../../pages/Clients/Chatbot/ChatWidget";

export default function HomeLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const {
    isLoggedIn,
    requestAgentChat,
    agentChatRoom,
    markChatAsRead,
    unreadCount,
  } = useChat();
  const toggleChat = async () => {
    if (!isChatOpen) {
      if (isLoggedIn && !agentChatRoom) {
        await requestAgentChat();
      }
      markChatAsRead();
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <ClientThemeProvider>
      <div className="bg-background">
        <Header />
        <main className="pb-5 min-h-[80svh] max-w-screen-xl mx-auto px-4">
          <Outlet />
        </main>
        <Footer />
        <ChatWidget />
    
        <div className="fixed bottom-5 right-5 z-[1000]">
          {isChatOpen && (
            <div className="absolute bottom-[75px] right-0 w-[24rem] min-h-[450px] max-h-[80vh] animate-fade-in-up">
              <ChatComponent
                agent={agentChatRoom?.agentDetails}
                onClose={toggleChat}
              />
            </div>
          )}
          <button
            onClick={toggleChat}
            className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-button text-accent-contrast shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-xl"
            aria-label={isChatOpen ? "Đóng chat" : "Mở chat"}
          >
            {/* Icon thay đổi theo trạng thái */}
            {isChatOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <MessageSquareText className="w-8 h-8" />
            )}

            {/* Số tin nhắn chưa đọc */}
            {!isChatOpen && unreadCount.current > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-danger text-xs text-white font-bold animate-pulse shadow-lg">
                {unreadCount.current > 9 ? "9+" : unreadCount.current}
              </span>
            )}
          </button>
        </div>
      </div>
    </ClientThemeProvider>
  );
}
