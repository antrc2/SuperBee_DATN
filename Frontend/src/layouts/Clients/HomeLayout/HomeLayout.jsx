import React, { useState } from "react"; // Import useState
import { Outlet } from "react-router-dom";
import Header from "@components/Client/layout/Header";
import Footer from "@components/Client/layout/Footer";
import { ChatComponent } from "../../../pages";
import { useChat } from "../../../contexts/ChatContext";

export default function HomeLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false); // State để kiểm soát hiển thị hộp thoại chat
  const { isLoggedIn, requestAgentChat } = useChat();
  const handleRequestAgentChat = async () => {
    try {
      await requestAgentChat();
    } catch (error) {
      console.error("Không thể tạo cuộc trò chuyện với agent:", error);
    }
  };
  const toggleChat = async () => {
    if (isLoggedIn) {
      await handleRequestAgentChat();
    }
    setIsChatOpen(!isChatOpen); // Đảo ngược trạng thái hiển thị chat
  };

  return (
    <div className="bg-gradient-header">
      <header>
        <Header />
      </header>
      <main className="min-h-[90svh]">
        <Outlet />
        {/* Phần chat box */}
        <div className="fixed bottom-4 right-4">
          {/* Nút/Icon chat */}
          <button
            onClick={toggleChat}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
            style={{
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Bạn có thể thay thế bằng icon tin nhắn thực tế từ thư viện như Font Awesome hoặc Heroicons */}
            {isChatOpen ? (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
            )}
          </button>

          {/* Hộp thoại chat, chỉ hiển thị khi isChatOpen là true */}
          {isChatOpen && (
            <div className="absolute bottom-[70px] right-0 w-[30rem] max-h-[600px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
              <ChatComponent />
            </div>
          )}
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
