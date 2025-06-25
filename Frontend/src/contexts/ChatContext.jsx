// src/contexts/HomeContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

// Đảm bảo đường dẫn import cho socket.js là đúng
import { authenticateSocket, getSocket, connectSocket } from "@utils/socket";
import { useAuth } from "./AuthContext"; // Giả định AuthContext cung cấp user và token

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { user, token } = useAuth();
  // const userName = user?.name; // Lấy tên người dùng nếu có

  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const socketRef = useRef(null);

  // Callback xử lý thông báo riêng tư
  // Kênh lắng nghe là "private_notification"
  const handlePrivateNotification = useCallback((payload) => {
    console.log("Thông báo riêng tư đã nhận:", payload);
    setNotifications((prev) => [
      ...prev,
      { ...payload, id: Date.now(), type: "private" },
    ]);
  }, []);

  // Callback xử lý thông báo chung
  // Kênh lắng nghe là "public_notification"
  const handlePublicNotification = useCallback((payload) => {
    console.log("Thông báo chung đã nhận:", payload);
    setNotifications((prev) => [
      ...prev,
      { ...payload, id: Date.now(), type: "public" },
    ]);
  }, []);

  // Callback xử lý tin nhắn chat mới từ server
  // Kênh lắng nghe là "new_chat_message"
  const handleNewChatMessage = useCallback((payload) => {
    console.log("Tin nhắn chat đã nhận:", payload);
    setChatMessages((prev) => [...prev, { ...payload, id: Date.now() }]);
  }, []);

  // Callback xử lý xác nhận gửi tin nhắn chat
  // Kênh lắng nghe là "chat_message_ack"
  const handleChatMessageAck = useCallback((payload) => {
    console.log("Xác nhận tin nhắn chat (ACK):", payload);
    // Cập nhật trạng thái tin nhắn trong UI (ví dụ: từ "đang gửi" sang "đã gửi")
  }, []);

  // Effect để quản lý kết nối socket và listeners
  useEffect(() => {
    console.log(
      "HomeContext: Effect chạy. Đang kết nối Socket với token hiện tại."
    );
    // Gọi connectSocket với token hiện tại để đảm bảo socket được cấu hình đúng
    connectSocket(token);

    // Lấy instance socket đã được cấu hình/kết nối
    socketRef.current = getSocket(token);
    const currentSocket = socketRef.current;

    // --- Đăng ký TẤT CẢ các listeners cho các sự kiện CỐ ĐỊNH ---
    // Socket.IO sẽ tự động định tuyến các sự kiện này tới đúng socket đã kết nối
    // khi server dùng io.to(socketId).emit("event_name", data);

    currentSocket.on("private_notification", handlePrivateNotification);
    currentSocket.on("public_notification", handlePublicNotification);
    currentSocket.on("new_chat_message", handleNewChatMessage);
    currentSocket.on("chat_message_ack", handleChatMessageAck);

    console.log(
      "Đã đăng ký các kênh lắng nghe: private_notification, public_notification, new_chat_message, chat_message_ack."
    );

    // --- Cleanup function ---
    return () => {
      if (currentSocket) {
        // Hủy đăng ký tất cả các listeners khi component unmount hoặc dependencies thay đổi
        currentSocket.off("private_notification", handlePrivateNotification);
        currentSocket.off("public_notification", handlePublicNotification);
        currentSocket.off("new_chat_message", handleNewChatMessage);
        currentSocket.off("chat_message_ack", handleChatMessageAck);
        console.log("Đã hủy đăng ký tất cả các kênh lắng nghe.");
      }
    };
  }, [
    token, // Re-run effect khi token thay đổi (đăng nhập/xuất)
    // userName không cần là dependency trực tiếp cho việc đăng ký kênh nếu kênh là cố định
    handlePrivateNotification,
    handlePublicNotification,
    handleNewChatMessage,
    handleChatMessageAck,
  ]);

  // Hàm gửi tin nhắn chat
  const sendChatMessage = (messagePayload) => {
    if (socketRef.current && socketRef.current.connected) {
      // Server sẽ kiểm tra quyền dựa trên socket.userId
      socketRef.current.emit("send_chat_message", messagePayload);
      console.log("Đã gửi tin nhắn chat:", messagePayload);
    } else {
      console.warn("Socket chưa kết nối, không thể gửi tin nhắn chat.");
      // Có thể hiển thị thông báo lỗi cho người dùng
    }
  };

  const value = {
    notifications,
    chatMessages,
    sendChatMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
}
