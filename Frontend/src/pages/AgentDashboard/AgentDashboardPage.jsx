// src/pages/AgentDashboard/AgentDashboardPage.jsx
import { AgentChatProvider } from "@contexts/AgentChatContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function AgentDashboardPage() {
  return (
    <AgentChatProvider>
      <div className="flex h-[calc(100vh - 100px)] bg-gray-100">
        {" "}
        {/* Giả định chiều cao màn hình */}
        <div className="flex w-full max-w-screen-xl mx-auto rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <ChatList />
          <ChatWindow />
        </div>
      </div>
    </AgentChatProvider>
  );
}
