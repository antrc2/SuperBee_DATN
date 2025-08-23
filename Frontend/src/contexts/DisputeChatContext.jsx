// src/contexts/DisputeChatContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getSocket, authenticateSocket } from "@utils/socket";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";
import api from "@utils/http";

const DisputeChatContext = createContext();

export const useDisputeChat = () => useContext(DisputeChatContext);

export function DisputeChatProvider({ children }) {
  const { token, user } = useAuth();
  const { pop } = useNotification();
  const socketRef = useRef(null);

  const [activeChat, setActiveChat] = useState({
    disputeId: null,
    roomId: null,
    messages: [],
    agentDetails: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo socket và lắng nghe tin nhắn mới
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    socketRef.current = socket;
    authenticateSocket(token);

    const handleNewMessage = (message) => {
      // Chỉ cập nhật nếu tin nhắn thuộc về phòng chat khiếu nại đang mở
      setActiveChat((current) => {
        if (current.roomId && current.roomId === message.chat_room_id) {
          // Thêm thông báo pop-up nếu tin nhắn không phải của mình
          if (message.sender_id !== user.id) {
            pop(`Tin nhắn mới: ${message.content.substring(0, 30)}...`);
          }
          return { ...current, messages: [...current.messages, message] };
        }
        return current;
      });
    };

    socket.on("new_chat_message", handleNewMessage);
    return () => socket.off("new_chat_message", handleNewMessage);
  }, [token, pop, user.id]);

  // Hàm để lấy hoặc tạo phòng chat
  const fetchDisputeChat = useCallback(
    async (disputeId) => {
      if (!disputeId) return;

      setIsLoading(true);
      setActiveChat({
        disputeId,
        roomId: null,
        messages: [],
        agentDetails: null,
      });

      try {
        const response = await api.post(`/disputes/${disputeId}/chat`);
        if (response.data.success) {
          const { roomInfo, messages, agentDetails } = response.data.data;
          setActiveChat({
            disputeId: disputeId,
            roomId: roomInfo.id,
            messages: messages || [],
            agentDetails: agentDetails,
          });
          // Tham gia phòng chat trên socket
          socketRef.current.emit("join_chat_room", roomInfo.id);
        }
      } catch (error) {
        pop(
          error.response?.data?.message || "Không thể tải cuộc trò chuyện.",
          "e"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [pop]
  );

  // Hàm gửi tin nhắn
  const sendDisputeMessage = useCallback(
    (content) => {
      if (!activeChat.roomId || !user?.id || !content.trim()) return;

      const payload = {
        roomId: activeChat.roomId,
        senderId: user.id,
        content: content.trim(),
      };

      // Gửi tin nhắn qua socket
      socketRef.current.emit("send_chat_message", payload);

      // Optimistic Update: Hiển thị tin nhắn của mình ngay lập tức
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        sender: { ...user },
      };
      setActiveChat((current) => ({
        ...current,
        messages: [...current.messages, tempMessage],
      }));
    },
    [activeChat.roomId, user]
  );

  const value = {
    ...activeChat,
    isLoading,
    fetchDisputeChat,
    sendDisputeMessage,
    currentUser: user,
  };

  return (
    <DisputeChatContext.Provider value={value}>
      {children}
    </DisputeChatContext.Provider>
  );
}
