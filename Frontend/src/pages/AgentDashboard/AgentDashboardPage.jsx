// src/pages/AgentDashboard/AgentDashboardPage.jsx
import React from "react";
import { AgentChatProvider } from "../../contexts/AgentChatContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function AgentDashboardPage() {
  return (
    <AgentChatProvider>
      <div className="flex h-screen bg-white">
        <ChatList />
        <ChatWindow />
      </div>
    </AgentChatProvider>
  );
}
