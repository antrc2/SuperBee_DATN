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
import { useNotification } from "./NotificationContext";
import { useHome } from "./HomeContext";
import api from "../utils/http";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { token, isLoggedIn } = useAuth();
  const refToken = useRef(null);
  const { pop } = useNotification();
  const { setNotifications, notifications } = useHome();
  const [agentChatRoom, setAgentChatRoom] = useState(null); // Lưu trữ thông tin phòng chat với nhân viên
  const socketRef = useRef(null);
  const unreadCount = useRef(0);
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
        agentDetails: data.agentDetails, // Thêm thông tin agent
        customerName: data.customerName, // Thêm thông tin customer
        customerAvatar: data.customerAvatar, // Thêm thông tin customer
      });
    };

    const handleNewChatMessage = (message) => {
      setAgentChatRoom((prev) => {
        // Chỉ xử lý nếu tin nhắn thuộc phòng chat hiện tại
        if (prev && prev.roomId === message.chat_room_id) {
          const isOwnMessage = refToken.current?.user_id === message.sender_id;

          // Chỉ tăng số tin chưa đọc nếu tin nhắn này KHÔNG PHẢI của mình
          const newUnreadCount = isOwnMessage
            ? prev.unreadCount // Giữ nguyên nếu là tin của mình
            : (unreadCount.current += 1);
          +1; // Tăng lên nếu là tin của người khác

          // Nếu là tin nhắn của chính mình gửi, vẫn đánh dấu là đã đọc trên server
          if (isOwnMessage) {
            socketRef.current.emit("mark_chat_as_read", {
              roomId: message.chat_room_id,
              messageId: message.id,
            });
          }

          return {
            ...prev,
            messages: [...prev.messages, message],
            unreadCount: newUnreadCount, // Cập nhật state với số đếm đúng
          };
        }

        // Nếu không khớp phòng chat, không làm gì cả
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
          agentDetails: chatDetails.agentDetails, // Thêm thông tin agent
          customerName: chatDetails.customerName, // Thêm thông tin customer
          customerAvatar: chatDetails.customerAvatar, // Thêm thông tin customer
          unreadCount: chatDetails.unreadCount || 0,
        });
        // Khi khôi phục phiên, đánh dấu tất cả tin nhắn là đã đọc
        if (
          chatDetails.messages.length > 0 &&
          socketRef.current &&
          refToken.current?.user_id
        ) {
          const lastMessageId =
            chatDetails.messages[chatDetails.messages.length - 1].id;
          socketRef.current.emit("mark_chat_as_read", {
            roomId: chatDetails.roomInfo.id,
            messageId: lastMessageId,
          });
        }
      }
    };
    const public_notifications = (data) => {
      pop("Bạn có thông báo mới chung", "s");
      setNotifications((prevNotifications) => {
        const newNotificationsToAdd = data.data;
        const updatedNotificationsArray = [
          newNotificationsToAdd,
          ...prevNotifications.notifications,
        ];

        const updatedCount = prevNotifications.count + 1;
        return {
          count: updatedCount,
          notifications: updatedNotificationsArray,
        };
      });
    };
    const private_notifications = (data) => {
      pop("Bạn có thông báo mới riêng", "s");
      setNotifications((prevNotifications) => {
        const newNotificationsToAdd = data.data;
        const updatedNotificationsArray = [
          newNotificationsToAdd,
          ...prevNotifications.notifications,
        ];
        const updatedCount = prevNotifications.count + 1;
        return {
          count: updatedCount,
          notifications: updatedNotificationsArray,
        };
      });
    };
    socket.on("restore_customer_session", handleRestoreSession);
    socket.on("chat_room_joined", handleChatRoomJoined);
    socket.on("new_chat_message", handleNewChatMessage);
    socket.on("new_chat_assigned", handleNewChatAssigned);
    socket.on("public_notifications", public_notifications);
    socket.on("private_notifications", private_notifications);

    return () => {
      socket.off("restore_customer_session", handleRestoreSession);
      socket.off("chat_room_joined", handleChatRoomJoined);
      socket.off("new_chat_message", handleNewChatMessage);
      socket.off("new_chat_assigned", handleNewChatAssigned);
      socket.off("public_notifications", public_notifications);
      socket.off("private_notifications", private_notifications);
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
      handleGetChat();
    }
  }, [token]);

  const handleGetChat = async () => {
    if (isLoggedIn) {
      try {
        const res = await api.get("/messages");
        const status = res?.data?.status;
        const chatData = res?.data?.data;
        // Nếu status là false hoặc không có chatData thì dừng lại
        if (!status || !chatData) {
          // Cân nhắc đặt agentChatRoom thành null ở đây nếu muốn reset state khi không có phòng chat
          // setAgentChatRoom(null);
          return;
        }

        // Cập nhật state với dữ liệu từ chatData
        setAgentChatRoom({
          roomId: chatData.roomInfo?.id,
          messages: chatData.messages || [],
          participants: chatData.roomInfo?.participants || [],
          info: chatData.roomInfo || {},
          agentDetails: chatData.agentDetails,
          // Lấy thông tin customer từ object customerDetails
          customerName: chatData.customerDetails?.username,
          customerAvatar: chatData.customerDetails?.avatar_url,
          unreadCount: chatData.unreadCount || 0, // Đảm bảo backend trả về trường này
        });
        unreadCount.current = chatData.unreadCount || 0;
      } catch (error) {
        console.log("Failed to get chat:", error);
        // Khi có lỗi, cũng nên reset state
        setAgentChatRoom(null);
      }
    } else {
      // Reset state khi người dùng logout
      setAgentChatRoom(null);
    }
  };
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
            agentDetails: response.agentDetails, // Thêm thông tin agent
            customerName: response.customerName, // Thêm thông tin customer
            customerAvatar: response.customerAvatar, // Thêm thông tin customer
            unreadCount: response.unreadCount || 0,
          });
          // Khi yêu cầu chat thành công, đánh dấu tất cả tin nhắn là đã đọc
          if (
            response.messages.length > 0 &&
            socketRef.current &&
            refToken.current?.user_id
          ) {
            const lastMessageId =
              response.messages[response.messages.length - 1].id;
            socketRef.current.emit("mark_chat_as_read", {
              roomId: response.roomId,
              messageId: lastMessageId,
            });
          }
          unreadCount.current = response.unreadCount || 0;
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
  // hàm đánh dấu đã đọc tin nhắn
  const markChatAsRead = useCallback(() => {
    setAgentChatRoom((prev) => {
      if (!prev || !prev.roomId || prev.unreadCount === 0) return prev;

      const lastMessage = prev.messages[prev.messages.length - 1];
      if (lastMessage) {
        socketRef.current.emit("mark_chat_as_read", {
          roomId: prev.roomId,
          messageId: lastMessage.id,
        });
      }
      // Reset số tin chưa đọc ở FE ngay lập tức
      return { ...prev, unreadCount: 0 };
    });
  }, []);
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
    refToken,
    markChatAsRead,
    notifications,
    unreadCount,
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
