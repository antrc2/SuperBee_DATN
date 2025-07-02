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
    console.log(
      `[SocketEvents] Client mới đã kết nối: ${socket.id}, ID người dùng: ${socket.userId}, Đã đăng nhập: ${socket.isLoggedIn}, Vai trò: ${socket.userRole}`
    );

    // --- SỰ KIỆN "authenticate": KHI CLIENT THAY ĐỔI TRẠNG THÁI XÁC THỰC ---
    socket.on("authenticate", async (token) => {
      // [THAY ĐỔI] Thêm async
      console.log(
        `[SocketEvents] Nhận sự kiện 'authenticate' từ Socket ${socket.id}.`
      );

      const previousUserId = socket.userId;
      const previousIsLoggedIn = socket.isLoggedIn;
      let newUserId;
      let newIsLoggedIn = false;
      let userRole = "guest";
      let authMessage = "Xác thực lại thất bại: Token không hợp lệ.";

      try {
        const decoded = token ? verifyToken(token) : null;

        if (decoded && decoded.user_id) {
          newUserId = decoded.user_id.toString();
          newIsLoggedIn = true;
          userRole = decoded.role_ids[0] || "customer";
          socket.userRole = userRole;
          authMessage = "Xác thực lại thành công.";
        } else {
          // Xử lý khi token không hợp lệ hoặc không có
          const currentGuestIdFromQuery = socket.handshake.query.guestId;
          newUserId = `${ANONYMOUS_USER_ID_PREFIX}${
            currentGuestIdFromQuery || uuidv4()
          }`;
          newIsLoggedIn = false;
          socket.userRole = "guest";
        }
      } catch (error) {
        // Xử lý lỗi khi verify token
        const currentGuestIdFromQuery = socket.handshake.query.guestId;
        newUserId = `${ANONYMOUS_USER_ID_PREFIX}${
          currentGuestIdFromQuery || uuidv4()
        }`;
        newIsLoggedIn = false;
        socket.userRole = "guest";
      }

      // Cập nhật ConnectionManager
      if (
        previousUserId !== newUserId ||
        previousIsLoggedIn !== newIsLoggedIn
      ) {
        connectionManager.removeConnection(socket.id);
        connectionManager.addConnection(newUserId, socket.id);
        socket.userId = newUserId;
        socket.isLoggedIn = newIsLoggedIn;
      }

      // Gửi phản hồi xác thực về cho client
      socket.emit("authenticated", {
        success: true,
        userId: socket.userId,
        isLoggedIn: socket.isLoggedIn,
        message: authMessage,
      });

      // ================================================================
      // [LOGIC MỚI] TỰ ĐỘNG KẾT NỐI LẠI PHÒNG CHAT CHO NHÂN VIÊN
      // ================================================================
      if (newIsLoggedIn && (userRole === "agent" || userRole === "admin")) {
        console.log(
          `[SocketEvents] Người dùng ${newUserId} (Vai trò: ${userRole}) đã xác thực. Khôi phục phiên làm việc...`
        );
        try {
          const activeChats = await getChatsByAgent(newUserId);
          if (activeChats && activeChats.length > 0) {
            activeChats.forEach((chat) => {
              if (chat.status !== "closed" && chat.status !== "resolved") {
                socket.join(chat.roomId.toString());
                console.log(
                  `[SocketEvents] Nhân viên ${newUserId} (Socket: ${socket.id}) đã tự động tham gia lại phòng ${chat.roomId}.`
                );
              }
            });

            // Gửi toàn bộ danh sách chat về cho dashboard của agent để khôi phục UI
            socket.emit("restore_agent_dashboard", { chats: activeChats });
            console.log(
              `[SocketEvents] Đã gửi dữ liệu khôi phục dashboard cho nhân viên ${newUserId}.`
            );
          }
        } catch (error) {
          console.error(
            `[SocketEvents] Lỗi khi khôi phục phiên cho nhân viên ${newUserId}:`,
            error
          );
        }
      }
      // (Tùy chọn) Thêm logic tương tự để khôi phục cho khách hàng nếu cần.
    });

    // --- SỰ KIỆN GỬI TIN NHẮN ---
    socket.on("send_chat_message", async (payload, callback) => {
      // [THAY ĐỔI] Thêm callback
      const { roomId, senderId, content } = payload;
      console.log("🚀 ~ socket.on ~ roomId:", roomId);
      console.log("🚀 ~ socket.on ~ content:", content);
      console.log("🚀 ~ socket.on ~ senderId:", senderId);

      if (!roomId || !senderId || !content) {
        if (callback)
          callback({ status: "error", message: "Dữ liệu không hợp lệ." });
        return;
      }

      try {
        const savedMessage = await saveMessageToDb(roomId, senderId, content);

        // Phát tin nhắn đến tất cả client trong phòng
        io.to(roomId.toString()).emit("new_chat_message", savedMessage);

        // Phản hồi cho người gửi rằng tin nhắn đã được xử lý
        if (callback) callback({ status: "sent", messageId: savedMessage.id });
      } catch (error) {
        console.error(
          `[SocketEvents] Lỗi khi lưu và gửi tin nhắn trong phòng ${roomId}:`,
          error
        );
        if (callback)
          callback({
            status: "error",
            message: "Lỗi server khi gửi tin nhắn.",
          });
      }
    });

    // --- SỰ KIỆN "disconnect": KHI CLIENT NGẮT KẾT NỐI ---
    socket.on("disconnect", () => {
      connectionManager.removeConnection(socket.id); //
      console.log(
        `[SocketEvents] Client đã ngắt kết nối: ${socket.id} (ID người dùng: ${socket.userId})` // [LOG MỚI]
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
            io.to(agentSocketIds).emit("new_chat_assigned", {
              roomId,
              customerId,
              // Gửi thêm thông tin để hiển thị trên dashboard của nhân viên
            });
            agentSocketIds.forEach((socketId) => {
              const agentSocket = io.sockets.sockets.get(socketId);
              if (agentSocket) {
                agentSocket.join(roomId.toString());
              }
            });
          }
        }
        callback({
          success: true,
          ...chatRoomData,
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
      // if (socket.userRole !== "admin") {
      //   console.warn(
      //     `[SocketEvents] User ${socket.userId} (vai trò: ${socket.userRole}) đã cố gắng truy cập sự kiện 'admin_get_agent_chats'.`
      //   );
      //   return callback({
      //     dfdfd: socket.userRole,
      //     success: false,
      //     message: "Hành động không được phép. Yêu cầu quyền quản trị viên.",
      //   });
      // }

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
  });
};

export default setupSocketEvents;
