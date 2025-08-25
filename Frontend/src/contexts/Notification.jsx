import React, { createContext, useContext, useEffect, useRef } from "react";
import { getSocket } from "../utils/socket"; //  utils/socket.js
import { useAuth } from "./AuthContext";
import { useNotification as useUINotification } from "./UINotificationContext"; // Đổi tên để tránh xung đột, đây là context cung cấp hàm `pop`

// Context này không cần cung cấp giá trị ra ngoài, nó chỉ là một trình lắng nghe chạy ngầm.
const NotificationListenerContext = createContext();

/**
 * Component Provider này có nhiệm vụ duy nhất:
 * Lắng nghe sự kiện notification từ Socket.IO và hiển thị nó ra màn hình bằng hàm `pop`.
 */
export function NotificationListenerProvider({ children }) {
  const { isLoggedIn } = useAuth();
  // Lấy hàm `pop` từ một context khác chuyên về hiển thị UI
  const { pop } = useUINotification();
  const socketRef = useRef(null);

  useEffect(() => {
    // Nếu chưa đăng nhập, không làm gì cả
    if (!isLoggedIn || !pop) {
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    // Hàm xử lý khi có thông báo mới
    const handleNewNotification = (payload) => {
      const newNotification = payload.data;
      if (!newNotification || !newNotification.content) return;

      console.log("Nhận được Alert:", newNotification);

      // SỬ DỤNG SWITCH-CASE ĐỂ QUYẾT ĐỊNH LOẠI ALERT
      // Dựa vào `newNotification.type` từ Laravel
      let alertType = "info"; // Mặc định là 'info'
      switch (newNotification.type) {
        case 1: // Khuyến mãi - Giảm giá
          alertType = "success";
          break;
        case 2: // Bảo trì hệ thống
          alertType = "warning";
          break;
        case 3: // Sự kiện toàn hệ thống
          alertType = "info";
          break;
        case 4: // Cảnh báo
          alertType = "error";
          break;
        case 5: // Tin nhắn từ Admin / Quy định mới
          alertType = "default";
          break;
        default:
          alertType = "info";
          break;
      }

      // Gọi hàm `pop` để hiển thị alert với nội dung và loại tương ứng
      pop(newNotification.content, alertType);
    };

    // Lắng nghe sự kiện từ server Node.js
    socket.on("private_notifications", handleNewNotification);
    socket.on("public_notifications", handleNewNotification);

    // Tham gia phòng chung để nhận tin công khai
    socket.emit("join_room", "public_notifications");

    // Dọn dẹp khi component unmount
    return () => {
      socket.off("private_notifications", handleNewNotification);
      socket.off("public_notifications", handleNewNotification);
      socket.emit("leave_room", "public_notifications");
    };
  }, [isLoggedIn, pop]); // Effect chạy lại khi trạng thái đăng nhập hoặc hàm `pop` thay đổi

  // Vì Provider này chỉ lắng nghe, nó không cần cung cấp giá trị nào, chỉ cần render children
  return <>{children}</>;
}
