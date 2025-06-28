// src/routers/socketEvents.js
import { verifyToken } from "../utils/jwt.js";
import connectionManager from "../models/ConnectionManager.js";
import { v4 as uuidv4 } from "uuid";
import {
  findOrCreateChatRoomForCustomer,
  getChatsByAgent,
  getChatDetails,
  saveMessageToDb,
} from "../models/Chat.js";

const ANONYMOUS_USER_ID_PREFIX = "guest_";

const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    // --- XỬ LÝ KHI CÓ KẾT NỐI MỚI ---
    // Giả sử authMiddleware của bạn đã được cập nhật để thêm `socket.userRole` từ JWT
    console.log(
      `[SocketEvents] Client mới đã kết nối: ${socket.id}, ID người dùng: ${socket.userId}, Đã đăng nhập: ${socket.isLoggedIn}, Vai trò: ${socket.userRole}`
    );

    // Nếu người dùng là admin, tự động cho họ vào một phòng riêng
    if (socket.userRole === "admin") {
      socket.join("admins_room");
      console.log(
        `[SocketEvents] Admin ${socket.userId} đã tham gia phòng 'admins_room'.`
      );
    }

    socket.emit("authenticated", {
      success: socket.isAuthenticated,
      userId: socket.userId,
      isLoggedIn: socket.isLoggedIn,
      message: socket.isLoggedIn
        ? "Kết nối ban đầu đã xác thực với ID người dùng."
        : "Kết nối ban đầu dưới dạng khách.",
    });

    // --- SỰ KIỆN "authenticate": KHI CLIENT THAY ĐỔI TRẠNG THÁI XÁC THỰC ---
    socket.on("authenticate", (token) => {
      const previousUserId = socket.userId;
      const previousIsLoggedIn = socket.isLoggedIn;

      let newUserId;
      let newIsLoggedIn = false;
      let authMessage = "Xác thực lại thất bại: Token không hợp lệ.";

      const decoded = token ? verifyToken(token) : null;
      if (decoded && decoded.user_id) {
        newUserId = decoded.user_id.toString();
        newIsLoggedIn = true;
        authMessage = "Xác thực lại thành công.";
        // Cập nhật vai trò và cho vào phòng admin nếu có
        socket.userRole = decoded.role_ids[0] || "customer";
        if (socket.userRole === "admin") {
          socket.join("admins_room");
        }
      } else {
        const currentGuestIdFromQuery = socket.handshake.query.guestId;
        newUserId = `${ANONYMOUS_USER_ID_PREFIX}${
          currentGuestIdFromQuery || uuidv4()
        }`;
        newIsLoggedIn = false;
        socket.userRole = "guest";
        authMessage =
          "Token không hợp lệ hoặc không có. Đang hoạt động với tư cách khách.";
      }

      if (
        previousUserId !== newUserId ||
        previousIsLoggedIn !== newIsLoggedIn
      ) {
        connectionManager.removeConnection(socket.id);
        connectionManager.addConnection(newUserId, socket.id);
        socket.userId = newUserId;
        socket.isLoggedIn = newIsLoggedIn;
        console.log(
          `[SocketEvents] Socket ${socket.id} đã cập nhật: ID người dùng từ ${previousUserId} -> ${newUserId}, Đã đăng nhập: ${newIsLoggedIn}, Vai trò: ${socket.userRole}`
        );
      }

      socket.join("public_notifications");

      socket.emit("authenticated", {
        success: true,
        userId: socket.userId,
        isLoggedIn: socket.isLoggedIn,
        message: authMessage,
      });
    });

    // --- SỰ KIỆN "disconnect": KHI CLIENT NGẮT KẾT NỐI ---
    socket.on("disconnect", () => {
      connectionManager.removeConnection(socket.id);
      console.log(
        `[SocketEvents] Client đã ngắt kết nối: ${socket.id} (ID người dùng: ${socket.userId})`
      );
    });

    // --- SỰ KIỆN "request_agent_chat": YÊU CẦU CHAT VỚI NHÂN VIÊN ---
    socket.on("request_agent_chat", async (data, callback) => {
      // 1. Kiểm tra xác thực
      if (!socket.isLoggedIn) {
        return callback({
          success: false,
          message: "Yêu cầu đăng nhập để chat với nhân viên.",
        });
      }

      const customerId = socket.userId;
      console.log(`User ${customerId} is requesting a chat.`);

      try {
        // 2. Tìm hoặc tạo phòng chat và gán nhân viên (logic nằm trong Chat.js)
        const chatRoomData = await findOrCreateChatRoomForCustomer(customerId);

        const { roomId, assignedAgentUserId } = chatRoomData;
        console.log("room", roomId);
        console.log("roomsssssssssssssssssssssss", assignedAgentUserId);

        // 3. Cho khách hàng tham gia vào phòng chat trên Socket.IO
        socket.join(roomId.toString());
        console.log(
          `User ${customerId} (Socket: ${socket.id}) joined room ${roomId}`
        );

        // 4. Nếu có nhân viên được gán, thông báo cho họ
        if (assignedAgentUserId) {
          const agentSocketIds =
            connectionManager.getSocketIdsByUserId(assignedAgentUserId);
          console.log(
            `Notifying agent ${assignedAgentUserId} on sockets: ${agentSocketIds.join(
              ", "
            )}`
          );
          if (agentSocketIds.length > 0) {
            // Gửi sự kiện đến TẤT CẢ các socket của nhân viên đó (nếu họ mở nhiều tab)
            io.to(agentSocketIds).emit("new_chat_assigned", {
              roomId,
              customerId,
              // Gửi thêm thông tin để hiển thị trên dashboard của nhân viên
            });
            // Cho các socket của nhân viên tham gia vào phòng chat để nhận tin nhắn
            agentSocketIds.forEach((socketId) => {
              const agentSocket = io.sockets.sockets.get(socketId);
              if (agentSocket) {
                agentSocket.join(roomId);
              }
            });
          }
        }

        // 5. Phản hồi cho khách hàng thành công, gửi lại thông tin phòng và lịch sử chat
        callback({
          success: true,
          ...chatRoomData, // Gửi lại toàn bộ dữ liệu từ findOrCreateChatRoomForCustomer
        });
      } catch (error) {
        console.error(
          `Error processing request_agent_chat for ${customerId}:`,
          error
        );
        callback({
          success: false,
          message: "Lỗi hệ thống khi tạo phòng chat.",
        });
      }
    });

    // ===================================================================
    // CÁC SỰ KIỆN DÀNH RIÊNG CHO ADMIN
    // ===================================================================

    /**
     * Sự kiện cho admin yêu cầu lấy danh sách các cuộc trò chuyện của một agent.
     */
    socket.on("admin_get_agent_chats", async ({ agentId }, callback) => {
      if (socket.userRole !== "admin") {
        console.warn(
          `[SocketEvents] User ${socket.userId} (vai trò: ${socket.userRole}) đã cố gắng truy cập sự kiện 'admin_get_agent_chats'.`
        );
        return callback({
          success: false,
          message: "Hành động không được phép. Yêu cầu quyền quản trị viên.",
        });
      }

      if (!agentId) {
        return callback({
          success: false,
          message: "Cần cung cấp ID của nhân viên.",
        });
      }

      try {
        const chats = await getChatsByAgent(agentId);
        callback({ success: true, data: chats });
      } catch (error) {
        console.error(
          `[SocketEvents] Lỗi khi lấy danh sách chat cho nhân viên ${agentId}:`,
          error
        );
        callback({
          success: false,
          message: "Lỗi máy chủ khi truy vấn danh sách cuộc trò chuyện.",
        });
      }
    });

    /**
     * Sự kiện cho admin yêu cầu lấy toàn bộ nội dung của một phòng chat cụ thể.
     */
    socket.on("admin_get_chat_details", async ({ roomId }, callback) => {
      if (socket.userRole !== "admin") {
        console.warn(
          `[SocketEvents] User ${socket.userId} (vai trò: ${socket.userRole}) đã cố gắng truy cập sự kiện 'admin_get_chat_details'.`
        );
        return callback({
          success: false,
          message: "Hành động không được phép. Yêu cầu quyền quản trị viên.",
        });
      }

      if (!roomId) {
        return callback({
          success: false,
          message: "Cần cung cấp ID của phòng chat.",
        });
      }

      try {
        const chatDetails = await getChatDetails(roomId);
        if (chatDetails) {
          callback({ success: true, data: chatDetails });
        } else {
          callback({ success: false, message: "Không tìm thấy phòng chat." });
        }
      } catch (error) {
        console.error(
          `[SocketEvents] Lỗi khi lấy chi tiết phòng chat ${roomId}:`,
          error
        );
        callback({
          success: false,
          message: "Lỗi máy chủ khi truy vấn chi tiết cuộc trò chuyện.",
        });
      }
    });
    socket.on("send_chat_message", async (payload, callback) => {
      const { roomId, senderId, content } = payload;
      console.log("🚀 ~ socket.on ~ senderId:", senderId);
      console.log("🚀 ~ socket.on ~ roomId:", roomId);
      console.log("🚀 ~ socket.on ~ content:", content);
      // 1. Lưu tin nhắn vào DB
      const savedMessage = await saveMessageToDb(roomId, senderId, content);

      // 2. Phát tin nhắn đến tất cả client trong phòng
      io.to(roomId).emit("new_chat_message", savedMessage);

      // 3. Gửi lại xác nhận cho người gửi
      callback({ status: "sent", messageId: savedMessage.id });
    });
  });
};

export default setupSocketEvents;
