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
      console.log("🚀 ~ handleNewChatMessage ~ message:", message);
      setAgentChatRoom((prev) => {
        if (prev && prev.roomId === message.chat_room_id) {
          return { ...prev, messages: [...prev.messages, message] };
        }
        return prev;
      });
    };

    const handleNewChatAssigned = (data) => {
      const roles = refToken.current?.role_ids || [];
      if (roles.includes("agent") || roles.includes("admin")) {
        console.log("A new chat has been assigned to you:", data);
      }
    };
    const handleRestoreSession = (chatDetails) => {
      console.log("Restoring customer chat session from server:", chatDetails);
      if (chatDetails && chatDetails.roomInfo) {
        setAgentChatRoom({
          roomId: chatDetails.roomInfo.id,
          messages: chatDetails.messages || [],
          participants: chatDetails.participants || [],
          info: chatDetails.roomInfo || {},
        });
      }
    };
    socket.on("restore_customer_session", handleRestoreSession);
    socket.on("chat_room_joined", handleChatRoomJoined);
    socket.on("new_chat_message", handleNewChatMessage);
    socket.on("new_chat_assigned", handleNewChatAssigned);

    return () => {
      socket.off("restore_customer_session", handleRestoreSession);
      socket.off("chat_room_joined", handleChatRoomJoined);
      socket.off("new_chat_message", handleNewChatMessage);
      socket.off("new_chat_assigned", handleNewChatAssigned);
    };
  }, [token]); // Thay đổi dependency thành [token]

  // Gửi lại token mỗi khi nó thay đổi (login/logout)
  useEffect(() => {
    if (socketRef.current) {
      console.log(
        `ChatContext: Token changed, calling authenticateSocket with token: ${
          token ? token.substring(0, 10) + "..." : "null"
        }`
      ); // [LOG MỚI]
      authenticateSocket(token);
    }
  }, [token]);

  // [LOG MỚI] Kiểm tra trạng thái isLoggedIn hiện tại
  console.log(
    "ChatContext: Current isLoggedIn state from useAuth:",
    isLoggedIn
  );

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
      socketRef.current.emit("send_chat_message", payload);
      return true;
    },
    [agentChatRoom?.roomId]
  );

  // hàm lấy danh sách chat dành cho admin
  const getAllChat = useCallback(() => {
    if (!isLoggedIn) {
      return Promise.reject(new Error("User is not logged in."));
    }
    if (!socketRef.current) {
      console.warn(
        "Socket not initialized or connected when calling getAllChat."
      );
      return;
    }
    return new Promise((resolve, reject) => {
      socketRef.current.emit(
        "admin_get_agent_chats",
        { agentId: refToken.current?.user_id },
        (response) => {
          if (response.success) {
            console.log("Chat request successful:", response);
            // Cập nhật trạng thái phòng chat từ phản hồi
            // setAgentChatRoom({
            //   roomId: response.roomId,
            //   messages: response.messages || [],
            //   info: { message: response.message },
            // });
            resolve(response);
          } else {
            console.error("Chat request failed:", response);
            reject(new Error(response.message));
          }
        }
      );
    });
  }, [isLoggedIn]);

  const value = {
    getAllChat,
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
