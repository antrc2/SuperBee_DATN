import React, { useState } from "react"; // Import useState
import { Outlet } from "react-router-dom";
import Header from "@components/Client/layout/Header";
import Footer from "@components/Client/layout/Footer";
import { ChatComponent } from "../../../pages";
import { useChat } from "../../../contexts/ChatContext";
import Left from "@assets/tn/left.png";
import Right from "@assets/tn/right.png";
export default function HomeLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="">
      <header className="sticky -top-[65px] z-999">
        <Header />
      </header>
      <main
        className="min-h-[90svh] " // Sử dụng flexbox, căn giữa và kéo dài các item
        // style={{
        //   backgroundImage:
        //     "url('https://i.pinimg.com/736x/67/84/55/67845596e2b37a0b5bc6c8048623bfc4.jpg')",
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        //   backgroundRepeat: "no-repeat",
        //   backgroundAttachment: "fixed",
        // }}
      >
        {/* Hình ảnh bên trái, chỉ hiển thị ở màn hình lớn hơn 1900px */}
        {/* <div className="w-[330px] h-full hidden 2xl:block flex-shrink-0">
          <img
            src={`${Left}`}
            className="h-full w-full object-contain"
            alt="Left decorative image"
          />
        </div> */}

        {/* Nội dung chính, giới hạn chiều rộng */}
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>

        {/* Hình ảnh bên phải, chỉ hiển thị ở màn hình lớn hơn 1900px */}
        {/* <div className="w-[330px] h-full hidden 2xl:block flex-shrink-0">
          <img
            src={`${Right}`}
            className="h-full w-full object-contain"
            alt="Right decorative image"
          />
        </div> */}

        {/* Phần chat box vẫn giữ nguyên */}
        <div className="fixed bottom-4 right-4">
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
