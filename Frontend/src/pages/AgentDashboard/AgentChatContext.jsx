// src/pages/AgentDashboard/AgentChatContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getSocket, connectSocket, authenticateSocket } from "@utils/socket"; // [THAY ĐỔI] Thêm authenticateSocket
import { useAuth } from "@contexts/AuthContext";

export const AgentChatContext = createContext();
export const useAgentChat = () => useContext(AgentChatContext);

export function AgentChatProvider({ children }) {
  const { token, user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Xác thực lại mỗi khi token thay đổi (quan trọng cho việc reload)
    authenticateSocket(token);

    // --- Lắng nghe các sự kiện từ server ---

    // [LOGIC MỚI] Lắng nghe sự kiện khôi phục dashboard
    const handleRestoreDashboard = (data) => {
      console.log("Restoring agent dashboard:", data);
      const formattedChatList = data.chats.map((chat) => ({
        ...chat,
        unreadCount: 0,
      }));
      setChatList(formattedChatList);
    };

    // --- Lắng nghe các sự kiện từ server ---

    // 1. Khi có cuộc trò chuyện mới được gán cho agent này
    const handleNewChatAssigned = (newChat) => {
      alert(`Bạn có cuộc trò chuyện mới từ khách hàng: ${newChat.customerId}`);
      // Thêm cuộc trò chuyện mới vào đầu danh sách
      setChatList((prevList) => {
        // Tránh thêm trùng lặp
        if (prevList.some((chat) => chat.roomId === newChat.roomId)) {
          return prevList;
        }
        return [
          {
            roomId: newChat.roomId,
            customerId: newChat.customerId, // Cần server trả về customerId
            lastMessage: newChat.lastMessage || "Cuộc trò chuyện mới.",
            unreadCount: 1, // Mặc định có 1 tin nhắn chưa đọc
            roomUpdatedAt: new Date().toISOString(),
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
      }

      // Cập nhật lastMessage và tăng unreadCount cho phòng tương ứng trong chatList
      setChatList(
        (prevList) =>
          prevList
            .map((chat) => {
              if (chat.roomId === message.chat_room_id) {
                const isChatActive = message.chat_room_id === activeChatId;
                return {
                  ...chat,
                  lastMessage: message.content,
                  unreadCount: isChatActive ? 0 : (chat.unreadCount || 0) + 1,
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
    socket.on("restore_agent_dashboard", handleRestoreDashboard); // [MỚI]
    socket.on("new_chat_assigned", handleNewChatAssigned);
    socket.on("new_chat_message", handleNewMessage);

    // --- Lấy dữ liệu ban đầu ---
    // // Yêu cầu server gửi danh sách các cuộc trò chuyện hiện có của agent
    // socket.emit("admin_get_agent_chats", { agentId: user.id }, (response) => {
    //   if (response.success) {
    //     // Định dạng lại dữ liệu từ server cho phù hợp với state
    //     const formattedChatList = response.data.map((chat) => ({
    //       ...chat,
    //       unreadCount: 0, // Tạm thời đặt là 0
    //     }));
    //     setChatList(formattedChatList);
    //   }
    // });

    // Dọn dẹp listener khi component unmount
    // Dọn dẹp listener
    return () => {
      socket.off("restore_agent_dashboard", handleRestoreDashboard); // [MỚI]
      socket.off("new_chat_assigned", handleNewChatAssigned);
      socket.off("new_chat_message", handleNewMessage);
    };
  }, [token, user?.id, activeChatId]);

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
          chat.roomId === roomId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    },
    [activeChatId]
  );

  // Khi agent gửi tin nhắn
  const sendMessage = useCallback(
    (content) => {
      if (!socketRef.current || !activeChatId || !content.trim()) {
        return;
      }
      const payload = {
        roomId: activeChatId,
        senderId: user.id,
        content: content.trim(),
      };

      // Gửi sự kiện lên server với một callback để nhận xác nhận
      socketRef.current.emit("send_chat_message", payload, (ack) => {
        if (ack && ack.status === "sent") {
          // Tin nhắn đã được server nhận và lưu, không cần làm gì thêm
          // vì sự kiện 'new_chat_message' sẽ cập nhật UI cho tất cả mọi người, bao gồm cả người gửi.
          console.log(`Message sent successfully, ID: ${ack.messageId}`);
        } else {
          alert(
            `Lỗi gửi tin nhắn: ${
              ack?.message || "Không nhận được phản hồi từ server."
            }`
          );
        }
      });
    },
    [activeChatId, user?.id]
  );

  const value = {
    chatList,
    activeChatId,
    messages,
    isLoading,
    selectChat,
    sendMessage,
  };

  return (
    <AgentChatContext.Provider value={value}>
      {children}
    </AgentChatContext.Provider>
  );
}
