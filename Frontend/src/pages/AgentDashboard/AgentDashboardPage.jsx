import { AgentChatProvider } from "@contexts/AgentChatContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function AgentDashboardPage() {
  return (
    <AgentChatProvider>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex w-full max-w-7xl mx-auto rounded-lg shadow-2xl overflow-hidden">
          <ChatList />
          <ChatWindow />
        </div>
      </div>
    </AgentChatProvider>
  );
}
