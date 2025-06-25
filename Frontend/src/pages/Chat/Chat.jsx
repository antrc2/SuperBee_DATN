// ChatComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@contexts/ChatContext"; // Đã điều chỉnh đường dẫn tương đối
import { useAuth } from "@contexts/AuthContext"; // Đã điều chỉnh đường dẫn tương đối
import { v4 as uuidv4 } from "uuid"; // Để tạo ID duy nhất cho mỗi tin nhắn client-side

// Đảm bảo bạn đã cài đặt uuid: npm install uuid

const ChatComponent = () => {
  // Biến 'chatMessages' này đã chứa và hiển thị lịch sử chat.
  // Nó được cung cấp từ ChatContext và tự động cập nhật khi có tin nhắn mới từ server.
  const { chatMessages, sendChatMessage } = useChat();
  console.log("🚀 ~ ChatComponent ~ chatMessages:", chatMessages);
  const { user } = useAuth(); // Lấy thông tin người dùng từ AuthContext
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // Ref để cuộn đến cuối danh sách tin nhắn

  // Cuộn xuống cuối danh sách tin nhắn mỗi khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    // Kiểm tra tin nhắn không rỗng VÀ user ID tồn tại
    if (newMessage.trim()) {
      // Tạo một ID duy nhất cho tin nhắn này ở phía client
      const messageId = uuidv4();

      // Payload để gửi đến server
      // chatRoomId cần được quản lý từ phía server hoặc context nếu có nhiều phòng chat.
      // Ở đây, tôi sẽ dùng một placeholder hoặc giả định nó được xử lý bởi server.
      // Dựa vào luồng bạn mô tả, server sẽ tìm/tạo chatRoomId.
      // Client chỉ cần gửi nội dung và người gửi.
      const messagePayload = {
        id: messageId, // ID duy nhất cho tin nhắn này (để server có thể xác nhận ACK)
        content: newMessage.trim(),
        sender_id: 6, // Sửa lại: ID của người gửi LẤY TỪ user?.id
        // chat_room_id: 'your_current_chat_room_id', // Nếu bạn đang trong một phòng chat cụ thể, hãy truyền ID vào đây
        // Nếu không, server sẽ xác định hoặc tạo mới.
      };

      sendChatMessage(messagePayload); // Gọi hàm gửi tin nhắn từ ChatContext
      setNewMessage(""); // Xóa nội dung textarea sau khi gửi
    } else if (!user?.id) {
      // Chỉ hiển thị cảnh báo này khi user?.id không tồn tại
      console.warn(
        "Vui lòng đăng nhập để gửi tin nhắn hoặc user ID không khả dụng."
      );
      // Hiển thị thông báo cho người dùng trên UI
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
    }
    // Nếu tin nhắn rỗng nhưng user?.id có, không làm gì cả
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Gửi khi nhấn Enter, không gửi khi nhấn Shift + Enter (xuống dòng)
      e.preventDefault(); // Ngăn xuống dòng mặc định trong textarea
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-[30rem] max-h-[45rem] bg-gray-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
        Hỗ Trợ Trực Tuyến
      </h2>

      {/* Vùng hiển thị tin nhắn */}
      <div className="flex-1 bg-white p-4 rounded-lg overflow-y-auto shadow-inner mb-4">
        {chatMessages.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
          </p>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={msg.id || index} // Sử dụng msg.id nếu có, nếu không thì dùng index (nhưng msg.id tốt hơn)
              className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                msg.sender_id === user?.id // Giả định msg.sender_id là ID người gửi, so sánh với user hiện tại
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-gray-800 self-start mr-auto"
              }`}
            >
              <p className="font-semibold">
                {msg.sender_id === user?.id
                  ? "Bạn"
                  : `Người dùng ${msg.sender_id || "khác"}`}
                :
              </p>
              <p>{msg.content}</p>
              {msg.attachment_url && (
                <a
                  href={msg.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 underline"
                >
                  Tệp đính kèm
                </a>
              )}
              <span className="block text-xs mt-1 opacity-75">
                {new Date(msg.created_at || Date.now()).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* Dùng để cuộn */}
      </div>

      {/* Vùng nhập tin nhắn */}
      <div className="flex items-center space-x-2">
        <textarea
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
          placeholder="Nhập tin nhắn của bạn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>
        <button
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
          onClick={handleSendMessage}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
