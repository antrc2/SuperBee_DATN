// src/contexts/ChatContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { getSocket, connectSocket, authenticateSocket } from "@utils/socket";
import { useAuth } from "@contexts/AuthContext";
import { decodeData } from "../utils/hook";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { token, isLoggedIn } = useAuth();
  const refToken = useRef(null);

  const [agentChatRoom, setAgentChatRoom] = useState(null); // Lưu trữ thông tin phòng chat với nhân viên
  const socketRef = useRef(null);

  // Khởi tạo và quản lý listeners
  useEffect(() => {
    // Di chuyển việc gán refToken vào trong effect để nó luôn được cập nhật khi token thay đổi
    if (token) {
      refToken.current = decodeData(token);
    } else {
      refToken.current = null; // Xóa refToken khi logout
    }

    const socket = getSocket();
    socketRef.current = socket;

    connectSocket();

    const handleChatRoomJoined = (data) => {
      console.log("Successfully joined chat room:", data);
      setAgentChatRoom({
        roomId: data.roomId,
        messages: data.messages || [],
        participants: data.participants || [],
        info: data.roomInfo || {},
      });
    };

    const handleNewChatMessage = (message) => {
      setAgentChatRoom((prev) => {
        if (prev && prev.roomId === message.chat_room_id) {
          return { ...prev, messages: [...prev.messages, message] };
        }
        return prev;
      });
    };

    const handleNewChatAssigned = (data) => {
      // Sửa 2: Truy cập `refToken.current` để lấy dữ liệu token đã giải mã
      const roles = refToken.current?.role_ids || [];

      // Sửa 3: Kiểm tra trong mảng `role_ids` bằng .includes()
      if (roles.includes("agent") || roles.includes("admin")) {
        console.log("A new chat has been assigned to you:", data);
        // Logic tự động mở cửa sổ chat cho nhân viên ở đây
      }
    };

    socket.on("chat_room_joined", handleChatRoomJoined);
    socket.on("new_chat_message", handleNewChatMessage);
    socket.on("new_chat_assigned", handleNewChatAssigned);

    return () => {
      socket.off("chat_room_joined", handleChatRoomJoined);
      socket.off("new_chat_message", handleNewChatMessage);
      socket.off("new_chat_assigned", handleNewChatAssigned);
    };
  }, [token]); // Thay đổi dependency thành [token]

  // Gửi lại token mỗi khi nó thay đổi (login/logout)
  useEffect(() => {
    if (socketRef.current) {
      authenticateSocket(token);
    }
  }, [token]);

  // Hàm để khách hàng yêu cầu chat
  const requestAgentChat = useCallback(() => {
    if (!isLoggedIn) {
      return Promise.reject(new Error("User is not logged in."));
    }

    return new Promise((resolve, reject) => {
      socketRef.current.emit("request_agent_chat", {}, (response) => {
        if (response.success) {
          console.log("Chat request successful:", response);
          // Cập nhật trạng thái phòng chat từ phản hồi
          setAgentChatRoom({
            roomId: response.roomId,
            messages: response.messages || [],
            info: { message: response.message },
          });
          resolve(response);
        } else {
          console.error("Chat request failed:", response.message);
          reject(new Error(response.message));
        }
      });
    });
  }, [isLoggedIn]);

  // Hàm gửi tin nhắn
  const sendChatMessage = useCallback(
    (content) => {
      if (!agentChatRoom?.roomId) return false;
      if (!refToken.current) return false;
      const payload = {
        roomId: agentChatRoom.roomId,
        content,
        senderId: refToken.current?.user_id,
      };
      socketRef.current.emit("send_chat_message", payload, (ack) => {
        console.log("🚀 ~ socketRef.current.emit ~ ack:", ack);
        // Xử lý ack nếu cần
      });
      return true;
    },
    [agentChatRoom?.roomId]
  );

  const value = {
    isLoggedIn,
    agentChatRoom,
    requestAgentChat,
    sendChatMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
