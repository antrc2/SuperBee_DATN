// src/contexts/ChatContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { getSocket, connectSocket, authenticateSocket } from "../utils/socket"; // Giả định bạn có file utils/socket.js
import { useAuth } from "./AuthContext";
import api from "../utils/http"; // File cấu hình axios
import { useNotification } from "./NotificationContext"; // Context thông báo

const ChatContext = createContext();

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat phải được sử dụng bên trong một ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }) {
  const { token, isLoggedIn, user } = useAuth();
  const { pop } = useNotification();

  const [agentChatRoom, setAgentChatRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const unreadCount = useRef(0);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);

  // Hàm cập nhật số tin nhắn chưa đọc
  const setUnread = (count) => {
    unreadCount.current = count;
    setUnreadCountState(count);
  };

  // Effect để khởi tạo và quản lý kết nối Socket.IO
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Hàm xử lý việc xác thực, sẽ được gọi mỗi khi kết nối thành công
    const handleConnectAndAuth = () => {
      console.log(
        "[ChatContext] Socket connected/reconnected. Authenticating..."
      );
      // Gửi token (nếu có) để xác thực hoặc báo cho server biết đây là guest
      authenticateSocket(token);
    };

    // Lắng nghe sự kiện 'connect' cho cả kết nối lần đầu và kết nối lại
    socket.on("connect", handleConnectAndAuth);

    // Lắng nghe sự kiện có tin nhắn mới từ server
    const handleNewChatMessage = (message) => {
      console.log("🚀 ~ handleNewChatMessage ~ message:", message);
      // Chỉ tăng bộ đếm nếu người gửi không phải là mình
      if (user?.id !== message.sender_id) {
        setUnread(unreadCount.current + 1);
        pop(`Bạn có tin nhắn mới từ ${message.sender_name}`, "i");
      }

      setAgentChatRoom((prevRoom) => {
        // Đảm bảo chỉ thêm tin nhắn vào đúng phòng chat
        if (prevRoom && prevRoom.roomId === message.chat_room_id) {
          // Tránh thêm tin nhắn trùng lặp
          if (prevRoom.messages.some((m) => m.id === message.id)) {
            return prevRoom;
          }
          return { ...prevRoom, messages: [...prevRoom.messages, message] };
        }
        return prevRoom;
      });
      const newMessage = {
        id: Date.now(),
        content: message?.content ?? null,
        sender_id: message.sender_id,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("new_chat_message", handleNewChatMessage);

    // Bắt đầu kết nối nếu chưa kết nối
    connectSocket();

    // Dọn dẹp listener khi component unmount
    return () => {
      socket.off("connect", handleConnectAndAuth);
      socket.off("new_chat_message", handleNewChatMessage);
    };
  }, [token, user?.id, pop]);

  /**
   * Yêu cầu 2: Bắt đầu cuộc trò chuyện
   * Gửi yêu cầu API đến backend để tìm nhân viên và tạo phòng.
   */
  const requestAgentChat = useCallback(
    async (chatType = "support") => {
      if (!isLoggedIn) {
        pop("Bạn cần đăng nhập để bắt đầu chat.", "warning");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post("/chat/request", { type: chatType });

        if (response.data?.success) {
          const chatData = response.data.data;
          const roomId = chatData.roomInfo.id;

          // Sau khi tạo phòng thành công, tham gia phòng đó trên socket
          socketRef.current.emit("join_chat_room", roomId);

          // Cập nhật state với toàn bộ thông tin trả về từ API
          setAgentChatRoom({
            roomId: roomId,
            messages: chatData.messages || [],
            participants: chatData.participants || [],
            info: chatData.roomInfo || {},
            agentDetails: chatData.agentDetails,
          });

          // Cập nhật số tin nhắn chưa đọc
          const unreadMessages = chatData.messages.filter(
            (m) => !m.is_read && m.sender_id !== user.id
          ).length;
          setUnread(unreadMessages);
        } else {
          throw new Error(
            response.data.message || "Không thể bắt đầu cuộc trò chuyện."
          );
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Đã có lỗi xảy ra.";
        setError(errorMessage);
        pop(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn, pop, user?.id]
  );

  /**
   * Yêu cầu 3: Gửi tin nhắn
   * Gửi sự kiện qua socket đến server Node.js.
   */
  const sendChatMessage = useCallback(
    (content) => {
      if (!agentChatRoom?.roomId || !user?.id) {
        console.error("Không thể gửi tin nhắn: thiếu roomId hoặc userId.");
        return false;
      }

      const payload = {
        roomId: agentChatRoom.roomId,
        senderId: user.id,
        content: content.trim(),
      };

      socketRef.current.emit("send_chat_message", payload, (response) => {
        if (response.status === "sent") {
          console.log("Server xác nhận đã nhận tin nhắn:", response.messageId);
        } else {
          console.error("Server báo lỗi khi gửi tin nhắn:", response.message);
          pop("Gửi tin nhắn thất bại, vui lòng thử lại.", "error");
        }
      });

      /**
       * Yêu cầu 4: Cập nhật đã đọc khi gửi tin nhắn
       * Khi gửi tin nhắn, reset bộ đếm và báo cho server
       */
      markChatAsRead();

      return true;
    },
    [agentChatRoom?.roomId, user?.id, pop]
  );

  const sendChatMessageDis = useCallback(
    (content, idRoom) => {
      if (!idRoom || !user?.id) {
        console.error("Không thể gửi tin nhắn: thiếu roomId hoặc userId.");
        return false;
      }

      const payload = {
        roomId: idRoom,
        senderId: user.id,
        content: content.trim(),
      };

      socketRef.current.emit("send_chat_message", payload, (response) => {
        if (response.status === "sent") {
          console.log("Server xác nhận đã nhận tin nhắn:", response.messageId);
        } else {
          console.error("Server báo lỗi khi gửi tin nhắn:", response.message);
          pop("Gửi tin nhắn thất bại, vui lòng thử lại.", "error");
        }
      });

      return true;
    },
    [user?.id, pop]
  );

  /**
   * Yêu cầu 4: Đánh dấu đã đọc
   * Gửi sự kiện lên server để cập nhật DB.
   */
  const markChatAsRead = useCallback(() => {
    if (unreadCount.current > 0 || true) {
      // Luôn gửi để server cập nhật
      setUnread(0);
      const lastMessage =
        agentChatRoom?.messages?.[agentChatRoom.messages.length - 1];

      if (socketRef.current && agentChatRoom?.roomId && lastMessage) {
        socketRef.current.emit("mark_chat_as_read", {
          roomId: agentChatRoom.roomId,
          messageId: lastMessage.id,
        });
      }
    }
  }, [agentChatRoom]);

  const value = {
    agentChatRoom,
    isLoading,
    error,
    isLoggedIn, // Thêm isLoggedIn để Chat.jsx có thể sử dụng trực tiếp
    user,
    requestAgentChat,
    sendChatMessage,
    markChatAsRead,
    unreadCount: unreadCountState, // Xuất ra state để UI re-render
    sendChatMessageDis,
    messages,
    setMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
