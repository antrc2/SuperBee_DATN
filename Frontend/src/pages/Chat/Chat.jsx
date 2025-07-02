import { useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { decodeData } from "../../utils/hook";

const ChatComponent = () => {
  const { isLoggedIn, agentChatRoom, sendChatMessage, requestAgentChat } =
    useChat();

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

  const handleRequestChat = async () => {
    try {
      await requestAgentChat();
    } catch (error) {
      console.error("Lỗi khi yêu cầu chat:", error.message);
      // Hiển thị thông báo lỗi cho người dùng
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-[30rem] max-h-[45rem] bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-xl border border-gray-200">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100">
            <div className="mb-5 text-blue-500">
              <svg
                className="mx-auto h-20 w-20 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-8 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.418-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
              Chức năng Chat
            </h3>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Bạn cần đăng nhập để sử dụng tính năng chat với nhân viên hỗ trợ.
            </p>
            <p className="text-sm text-gray-400 italic">
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
        sender_avatar:
          refToken.current?.avatar_url ||
          "https://placehold.co/40x40/cbd5e0/475569?text=You",
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
    <div className="flex flex-col max-h-[45rem] bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
      {/* Header của Chat (hiển thị thông tin agent nếu có) */}
      {agentChatRoom?.agentDetails && (
        <div className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl shadow-md mb-5">
          <img
            src={
              agentChatRoom.agentDetails.agentAvatar ||
              "https://placehold.co/48x48/ffffff/334155?text=Agent"
            }
            alt="Agent Avatar"
            className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-blue-200"
          />
          <div>
            <p className="font-bold text-xl">
              {agentChatRoom.agentDetails.agentName || "Nhân viên hỗ trợ"}
            </p>
            {agentChatRoom.agentDetails.average_rating !== null && (
              <p className="text-sm text-blue-100">
                ⭐ Đánh giá: {agentChatRoom.agentDetails.average_rating} (
                {agentChatRoom.agentDetails.total_ratings_count} lượt)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Khu vực hiển thị tin nhắn chat chính */}
      <div className="flex-1 bg-gray-50 p-4 rounded-lg overflow-y-auto shadow-inner mb-5 flex flex-col space-y-3 custom-scrollbar border border-gray-100">
        {localMessages.map((msg) => {
          // Xác định xem tin nhắn có phải do người dùng hiện tại gửi hay không
          const isOwnMessage = msg.sender_id == refToken.current?.user_id;
          return (
            <div
              key={msg.id} // Sử dụng ID tin nhắn làm khóa để React render danh sách
              className={`flex items-end gap-3 max-w-[85%] ${
                isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* <img
                src={
                  msg.sender_avatar ||
                  "https://placehold.co/40x40/cbd5e0/475569?text=User"
                }
                alt={`${msg.sender_name || "Người dùng"} Avatar`}
                className="w-9 h-9 rounded-full object-cover shadow-sm"
              /> */}
              <div
                className={`p-4 rounded-xl shadow-md relative ${
                  isOwnMessage
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="font-semibold text-sm mb-1">
                  {isOwnMessage
                    ? "Bạn"
                    : `${msg.sender_name || "Nhân viên hỗ trợ"}`}
                </p>
                <p className="text-base leading-relaxed">{msg.content}</p>
                <span
                  className={`block text-xs mt-2 ${
                    isOwnMessage ? "text-blue-200" : "text-gray-500"
                  } text-right`}
                >
                  {/* Định dạng dấu thời gian tin nhắn theo giờ địa phương */}
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {agentChatRoom?.roomId ? (
        <div className="flex items-center p-3 bg-white rounded-xl shadow-lg border border-gray-200">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-400 shadow-sm"
            onKeyPress={(e) => {
              // Gửi tin nhắn khi nhấn phím Enter
              if (e.key === "Enter" && !e.shiftKey) {
                // Thêm !e.shiftKey để cho phép xuống dòng bằng Shift+Enter
                e.preventDefault(); // Ngăn chặn xuống dòng mặc định
                handleSendMessage();
              }
            }}
            disabled={!agentChatRoom?.roomId} // Vô hiệu hóa ô nhập nếu không có chat đang hoạt động
          />
          <button
            onClick={handleSendMessage}
            className="ml-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md transform active:scale-95"
            disabled={!newMessage.trim() || !agentChatRoom?.roomId} // Vô hiệu hóa nút gửi nếu không có tin nhắn hoặc không có chat đang hoạt động
          >
            Gửi
          </button>
        </div>
      ) : (
        <button
          onClick={handleRequestChat}
          className="w-full px-6 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors duration-200 shadow-lg transform active:scale-95 text-lg"
        >
          Yêu cầu Chat với Nhân viên ✨
        </button>
      )}
    </div>
  );
};

export default ChatComponent;
