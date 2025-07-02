// src/pages/AgentDashboard/AgentChatContext.jsx
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
import { decodeData } from "../utils/hook";
import { useNotification } from "./NotificationContext";

const AgentChatContext = createContext();

export function AgentChatProvider({ children }) {
  const { pop } = useNotification();
  const refToken = useRef(null);
  const { token, user } = useAuth();
  const [chatList, setChatList] = useState([]);
  console.log("🚀 ~ AgentChatProvider ~ chatList:", chatList);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      refToken.current = decodeData(token);
    } else {
      refToken.current = null; // Xóa refToken khi logout
    }
    if (!user?.name) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Xác thực lại mỗi khi token thay đổi (quan trọng cho việc reload)
    authenticateSocket(token);

    // [LOGIC MỚI] Lắng nghe sự kiện khôi phục dashboard
    const handleRestoreDashboard = (data) => {
      const formattedChatList = data.chats.map((chat) => ({
        ...chat,
        // unreadCount đã được tính toán từ server
      }));
      setChatList(formattedChatList);
    };

    // --- Lắng nghe các sự kiện từ server ---

    // 1. Khi có cuộc trò chuyện mới được gán cho agent này
    const handleNewChatAssigned = (newChat) => {
      console.log("🚀 ~ handleNewChatAssigned ~ newChat:", newChat.roomId);
      const a = chatList.filter((e) => e.roomId == newChat.roomId);
      console.log("🚀 ~ handleRestoreDashboard ~ a:", a);
      if (a.length > 0) return;
      pop("Bạn có thêm cuộc chat mới", "s");
      // Thêm cuộc trò chuyện mới vào đầu danh sách
      setChatList((prevList) => {
        // Tránh thêm trùng lặp
        if (prevList.some((chat) => chat.roomId === newChat.roomId)) {
          return prevList;
        }
        return [
          {
            roomId: newChat.roomId,
            customerId: newChat.customerId,
            customerName: newChat.customerName,
            customerAvatar: newChat.customerAvatar,
            lastMessage: newChat.lastMessage || "Cuộc trò chuyện mới.",
            unreadMessageCount: newChat.unreadMessageCount || 1, // Sử dụng unreadMessageCount từ server
            roomUpdatedAt: newChat.roomUpdatedAt,
          },
          ...prevList,
        ];
      });
    };

    // 2. Khi có tin nhắn mới trong bất kỳ phòng chat nào của agent
    const handleNewMessage = (message) => {
      // Nếu tin nhắn thuộc phòng đang mở, thêm vào danh sách messages để hiển thị ngay
      if (message.chat_room_id === activeChatId) {
        setMessages((prev) => [...prev, message]);
        // Nếu tin nhắn đến từ người khác và phòng đang hoạt động, đánh dấu là đã đọc
        if (
          socketRef.current &&
          message.sender_id != refToken.current?.user_id
        ) {
          socketRef.current.emit("mark_chat_as_read", {
            roomId: message.chat_room_id,
            messageId: message.id,
          });
        }
      }

      // Cập nhật lastMessage và tăng unreadCount cho phòng tương ứng trong chatList
      setChatList(
        (prevList) =>
          prevList
            .map((chat) => {
              if (chat.roomId === message.chat_room_id) {
                const isChatActive = message.chat_room_id === activeChatId;
                const newUnreadCount =
                  isChatActive || message.sender_id == refToken.current?.user_id
                    ? 0 // Nếu chat đang active hoặc tin nhắn do agent gửi, reset unreadCount
                    : (chat.unreadMessageCount || 0) + 1; // Ngược lại, tăng unreadCount
                return {
                  ...chat,
                  lastMessage: message.content,
                  unreadMessageCount: newUnreadCount,
                  roomUpdatedAt: new Date().toISOString(), // Cập nhật thời gian để sort
                };
              }
              return chat;
            })
            .sort(
              (a, b) => new Date(b.roomUpdatedAt) - new Date(a.roomUpdatedAt)
            ) // Sắp xếp lại để chat mới nhất lên đầu
      );
    };
    socket.on("restore_agent_dashboard", handleRestoreDashboard);
    socket.on("new_chat_assigned", handleNewChatAssigned);
    socket.on("new_chat_message", handleNewMessage);

    // Dọn dẹp listener khi component unmount
    return () => {
      socket.off("restore_agent_dashboard", handleRestoreDashboard);
      socket.off("new_chat_assigned", handleNewChatAssigned);
      socket.off("new_chat_message", handleNewMessage);
    };
  }, [token, activeChatId, user?.name, refToken.current?.user_id]); // Thêm refToken.current?.user_id vào dependency

  // --- PHẦN 2: CÁC HÀM HÀNH ĐỘNG ---

  // Khi agent chọn một cuộc trò chuyện để xem
  const selectChat = useCallback(
    (roomId) => {
      if (roomId === activeChatId || !socketRef.current) return;

      setActiveChatId(roomId);
      setMessages([]); // Xóa tin nhắn cũ
      setIsLoading(true); // Bắt đầu loading

      // Yêu cầu server gửi chi tiết và lịch sử tin nhắn của phòng này
      socketRef.current.emit(
        "admin_get_chat_details",
        { roomId },
        (response) => {
          if (response.success) {
            setMessages(response.data.messages || []); // Cập nhật messages
            // Đánh dấu tin nhắn là đã đọc sau khi tải lịch sử
            if (
              response.data.messages.length > 0 &&
              refToken.current?.user_id
            ) {
              const lastMessageId =
                response.data.messages[response.data.messages.length - 1].id;
              socketRef.current.emit("mark_chat_as_read", {
                roomId: roomId,
                messageId: lastMessageId,
              });
            }
          } else {
            alert("Lỗi: Không thể tải lịch sử tin nhắn.");
            console.error(response.message);
          }
          setIsLoading(false); // Kết thúc loading
        }
      );

      // Reset unread count của phòng vừa bấm vào
      setChatList((prevList) =>
        prevList.map((chat) =>
          chat.roomId === roomId ? { ...chat, unreadMessageCount: 0 } : chat
        )
      );
    },
    [activeChatId, refToken.current?.user_id] // Thêm refToken.current?.user_id vào dependency
  );

  // Khi agent gửi tin nhắn
  // Hàm gửi tin nhắn
  const sendMessage = useCallback(
    (content) => {
      if (!activeChatId) return false;
      if (!refToken.current) return false;
      const payload = {
        roomId: activeChatId,
        content,
        senderId: refToken.current?.user_id,
      };
      socketRef.current.emit("send_chat_message", payload);
      return true;
    },
    [activeChatId]
  );

  const value = {
    chatList,
    activeChatId,
    messages,
    isLoading,
    selectChat,
    sendMessage,
    refToken,
  };

  return (
    <AgentChatContext.Provider value={value}>
      {children}
    </AgentChatContext.Provider>
  );
}
export const useAgentChat = () => useContext(AgentChatContext);
