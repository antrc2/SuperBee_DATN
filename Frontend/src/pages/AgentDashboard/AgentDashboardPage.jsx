import { AgentChatProvider } from "@contexts/AgentChatContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function AgentDashboardPage() {
  return (
    <AgentChatProvider>
      {/* Nền chính: trắng ở chế độ sáng, gray-900 ở chế độ tối */}
      <div className="flex h-[86svh] bg-white dark:bg-gray-900">
        <div className="flex w-full max-w-screen-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
          <ChatList />
          <ChatWindow />
        </div>
      </div>
    </AgentChatProvider>
  );
}
