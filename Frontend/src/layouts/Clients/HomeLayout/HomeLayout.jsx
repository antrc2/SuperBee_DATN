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
      </div>
    </ClientThemeProvider>
  );
}
