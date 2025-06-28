import { useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { decodeData } from "../../utils/hook";

const ChatComponent = () => {
  const { isLoggedIn, agentChatRoom, sendChatMessage } = useChat();

  const refToken = useRef(null);
  const { token } = useAuth();
  useEffect(() => {
    if (token) {
      refToken.current = decodeData(token);
    } else {
      refToken.current = null; // Xóa refToken khi đăng xuất
    }
  }, [token]);

  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (agentChatRoom?.messages) {
      setLocalMessages(agentChatRoom.messages);
    } else {
      setLocalMessages([]);
    }
  }, [agentChatRoom?.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-[30rem] max-h-[45rem] bg-gray-100 p-4 rounded-lg shadow-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-8 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.418-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chức năng Chat
            </h3>
            <p className="text-gray-500 mb-4">
              Bạn cần đăng nhập để sử dụng tính năng chat với nhân viên hỗ trợ.
            </p>
            <p className="text-sm text-gray-400">
              Tuy nhiên, bạn vẫn có thể nhận thông báo chung từ hệ thống.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Xử lý gửi tin nhắn mới.
  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && agentChatRoom?.roomId) {
      const tempMessage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        sender_id: refToken.current?.user_id,
        sender_name: "Bạn",
        content: trimmedMessage,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prevMessages) => [...prevMessages, tempMessage]);
      setNewMessage("");
      const success = sendChatMessage(trimmedMessage);
      if (!success) {
        console.error("Không thể gửi tin nhắn ngay lập tức do sự cố nội bộ.");
      }
    }
  };

  return (
    <div className="flex flex-col max-h-[45rem] bg-gray-100 p-4 rounded-lg shadow-lg">
      {/* Khu vực hiển thị tin nhắn chat chính */}
      <div className="flex-1 bg-white p-4 rounded-lg overflow-y-auto shadow-inner mb-4 flex flex-col space-y-2">
        {localMessages.map((msg) => {
          // Xác định xem tin nhắn có phải do người dùng hiện tại gửi hay không
          const isOwnMessage = msg.sender_id == refToken.current?.user_id;
          return (
            <div
              key={msg.id} // Sử dụng ID tin nhắn làm khóa để React render danh sách
              className={`p-3 rounded-lg max-w-[80%] ${
                isOwnMessage
                  ? "bg-blue-500 text-white self-end ml-auto" // Kiểu dáng cho tin nhắn của chính mình (căn phải, màu xanh)
                  : "bg-gray-300 text-gray-800 self-start mr-auto" // Kiểu dáng cho các tin nhắn khác (căn trái, màu xám)
              }`}
            >
              <p className="font-semibold text-sm">
                {isOwnMessage
                  ? "Bạn"
                  : `${msg.sender_name || "Nhân viên hỗ trợ"}`}
              </p>
              <p className="text-base">{msg.content}</p>
              <span className="block text-xs mt-1 opacity-75">
                {/* Định dạng dấu thời gian tin nhắn theo giờ địa phương */}
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {agentChatRoom?.roomId && (
        <div className="flex items-center p-2 bg-white rounded-lg shadow">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              // Gửi tin nhắn khi nhấn phím Enter
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={!agentChatRoom?.roomId} // Vô hiệu hóa ô nhập nếu không có chat đang hoạt động
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!newMessage.trim() || !agentChatRoom?.roomId} // Vô hiệu hóa nút gửi nếu không có tin nhắn hoặc không có chat đang hoạt động
          >
            Gửi
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
