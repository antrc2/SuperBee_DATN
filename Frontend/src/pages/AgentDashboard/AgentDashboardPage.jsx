// src/pages/AgentDashboard/AgentDashboardPage.jsx
import { AgentChatProvider } from "@contexts/AgentChatContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function AgentDashboardPage() {
  return (
    <AgentChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="h-screen flex p-2 sm:p-4">
          {/* Main chat container */}
          <div className="flex w-full max-w-full lg:max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-xl lg:shadow-2xl rounded-lg lg:rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <ChatList />
            <ChatWindow />
          </div>
        </div>
      </div>
    </AgentChatProvider>
  );
}
