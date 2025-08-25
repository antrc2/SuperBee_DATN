// src/contexts/AgentChatContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getSocket, authenticateSocket } from "@utils/socket";
import { useAuth } from "@contexts/AuthContext";
import { useNotification } from "./NotificationContext";
import api from "@utils/http";

const AgentChatContext = createContext();

export const useAgentChat = () => useContext(AgentChatContext);

export function AgentChatProvider({ children }) {
  const { pop } = useNotification();
  const { token, user } = useAuth();

  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const socketRef = useRef(null);

  /**
   * SỬA LỖI QUAN TRỌNG:
   * Vấn đề: Hàm handleNewMessage cũ không được cập nhật với state mới nhất (như activeChatId),
   * dẫn đến việc nó không thể xử lý đúng tin nhắn đến khi không có chat nào đang được chọn.
   * Giải pháp: Thêm `activeChatId` và `user` vào danh sách dependency của `useCallback`.
   * Điều này đảm bảo rằng mỗi khi nhân viên chọn một cuộc trò chuyện khác (hoặc không chọn),
   * hàm handleNewMessage sẽ được "làm mới" với thông tin chính xác.
   */
  const handleNewMessage = useCallback(
    (message) => {
      // Luồng 1: Cập nhật cửa sổ chat đang mở (nếu có)
      if (message.chat_room_id === activeChatId) {
        setMessages((prev) => [...prev, message]);
        // Tự động đánh dấu đã đọc khi đang xem
        if (socketRef.current) {
          socketRef.current.emit("mark_chat_as_read", {
            roomId: message.chat_room_id,
            messageId: message.id,
          });
        }
      }

      // Luồng 2: Cập nhật danh sách chat bên trái (LUÔN LUÔN chạy)
      setChatList((prevList) => {
        const chatExists = prevList.some(
          (chat) => chat.roomId === message.chat_room_id
        );

        if (chatExists) {
          // Nếu phòng chat đã có trong danh sách -> cập nhật nó
          return prevList
            .map((chat) => {
              if (chat.roomId === message.chat_room_id) {
                const isChatActive = message.chat_room_id === activeChatId;
                const isOwnMessage = message.sender_id === user?.id;

                // Chỉ tăng unreadCount nếu tin nhắn không phải của mình VÀ phòng đó đang không mở
                const newUnreadCount =
                  isOwnMessage || isChatActive
                    ? 0
                    : (chat.unreadCount || 0) + 1;

                return {
                  ...chat,
                  lastMessage: message.content,
                  unreadCount: newUnreadCount,
                  roomUpdatedAt: new Date().toISOString(), // Cập nhật thời gian để đẩy lên đầu
                };
              }
              return chat;
            })
            .sort(
              (a, b) => new Date(b.roomUpdatedAt) - new Date(a.roomUpdatedAt)
            ); // Sắp xếp lại danh sách
        } else {
          // Nếu là phòng chat hoàn toàn mới -> thông báo và tải lại toàn bộ danh sách
          pop(`Bạn có cuộc trò chuyện mới từ khách hàng!`, "s");
          // Gọi lại hàm fetch để lấy thông tin đầy đủ của phòng mới
          if (typeof fetchInitialChatList === "function") {
            fetchInitialChatList();
          }
          return prevList;
        }
      });
    },
    [activeChatId, user?.id, pop]
  );

  const fetchInitialChatList = useCallback(async () => {
    if (!token) return;
    setIsListLoading(true);
    try {
      const response = await api.get("/admin/agent/chats");
      if (response.data.success) {
        setChatList(response.data.data);
      }
    } catch (error) {
      pop("Không thể tải danh sách cuộc trò chuyện.", "e");
    } finally {
      setIsListLoading(false);
    }
  }, [token, pop]);

  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = getSocket();
    socketRef.current = socket;
    authenticateSocket(token);
    fetchInitialChatList();

    // Đăng ký listener mới đã được sửa lỗi
    socket.on("new_chat_message", handleNewMessage);

    // Dọn dẹp listener khi component unmount
    return () => socket.off("new_chat_message", handleNewMessage);
  }, [token, user?.id, handleNewMessage, fetchInitialChatList]);

  // Hàm gửi tin nhắn (thêm optimistic update để hiển thị ngay)
  const sendMessage = useCallback(
    (content) => {
      if (!activeChatId || !user) return false;

      // Tạo tin nhắn tạm để hiển thị ngay lập tức trên giao diện
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chat_room_id: activeChatId,
        sender_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        sender: { id: user.id, username: user.name, avatar_url: user.avatar },
      };
      // setMessages((prev) => [...prev, tempMessage]);

      // Gửi tin nhắn thật lên server
      const payload = {
        roomId: activeChatId,
        content: content.trim(),
        senderId: user.id,
      };
      socketRef.current.emit("send_chat_message", payload);
      return true;
    },
    [activeChatId, user]
  );

  // Các hàm khác giữ nguyên
  const selectChat = useCallback(
    async (roomId) => {
      if (roomId === activeChatId) return;
      setActiveChatId(roomId);
      setMessages([]);
      setIsLoading(true);

      try {
        const response = await api.get(`/admin/agent/chats/${roomId}`);
        if (response.data.success) {
          setMessages(response.data.data.messages || []);
        }
      } catch (error) {
        pop("Không thể tải tin nhắn: " + error.message, "e");
        setActiveChatId(null);
      } finally {
        setIsLoading(false);
      }

      setChatList((prevList) =>
        prevList.map((chat) =>
          chat.roomId === roomId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    },
    [activeChatId, pop]
  );

  const value = {
    chatList,
    activeChatId,
    messages,
    isLoading,
    isListLoading,
    selectChat,
    sendMessage,
    currentUser: user,
  };

  return (
    <AgentChatContext.Provider value={value}>
      {children}
    </AgentChatContext.Provider>
  );
}
