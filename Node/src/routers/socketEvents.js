// src/routers/socketEvents.js
import connectionManager from "../models/ConnectionManager.js";
import { saveMessageToDb, updateLastReadMessage } from "../models/Chat.js";
import { verifyToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";

const ANONYMOUS_USER_ID_PREFIX = "guest_";

const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `[socketEvents.js] Client mới đã kết nối: Socket ID ${socket.id}, User ID ban đầu: ${socket.userId}`
    );

    socket.on("authenticate", async (token) => {
      console.log(
        `[socketEvents.js] -> Nhận sự kiện 'authenticate' từ Socket ${socket.id}`
      );

      const previousUserId = socket.userId;
      let newUserId;
      let newIsLoggedIn = false;
      let userRole = "guest";

      try {
        const decoded = token ? verifyToken(token) : null;
        if (decoded && decoded.user_id) {
          newUserId = decoded.user_id.toString();
          newIsLoggedIn = true;
          userRole = decoded.role_ids?.[0] || "customer";
          console.log(
            `[socketEvents.js] Xác thực thành công cho User ID: ${newUserId}`
          );
        } else {
          const guestId = socket.handshake.query.guestId || uuidv4();
          newUserId = `${ANONYMOUS_USER_ID_PREFIX}${guestId}`;
          console.log(
            `[socketEvents.js] Xác thực thất bại hoặc không có token. Giữ/Tạo Guest ID: ${newUserId}`
          );
        }
      } catch (error) {
        const guestId = socket.handshake.query.guestId || uuidv4();
        newUserId = `${ANONYMOUS_USER_ID_PREFIX}${guestId}`;
      }

      if (previousUserId !== newUserId) {
        console.log(
          `[socketEvents.js] User ID thay đổi từ '${previousUserId}' thành '${newUserId}'. Cập nhật ConnectionManager.`
        );
        connectionManager.removeConnection(socket.id);
        connectionManager.addConnection(newUserId, socket.id);
        socket.userId = newUserId;
        socket.isLoggedIn = newIsLoggedIn;
        socket.userRole = userRole;
      }

      console.log(
        `[socketEvents.js] <- Gửi lại sự kiện 'authenticated' cho Socket ${socket.id}`
      );
      socket.emit("authenticated", {
        success: true,
        userId: socket.userId,
        isLoggedIn: socket.isLoggedIn,
      });
    });

    socket.on("join_chat_room", (roomId) => {
      console.log(
        `[socketEvents.js] -> Nhận sự kiện 'join_chat_room' từ Socket ${socket.id} (User: ${socket.userId}) để tham gia phòng ${roomId}`
      );
      if (roomId) {
        socket.join(roomId.toString());
        console.log(
          `[socketEvents.js] Socket ${socket.id} đã tham gia thành công phòng ${roomId}`
        );
      }
    });

    // src/routers/socketEvents.js

    // ...
    socket.on("send_chat_message", async (payload, callback) => {
      const { roomId, senderId, content } = payload;
      console.log(
        `[socketEvents.js] -> Nhận sự kiện 'send_chat_message' từ User ${senderId} tới phòng ${roomId}. Nội dung: "${content}"`
      );

      if (!roomId || !senderId || !content) {
        console.error(
          "[socketEvents.js] Lỗi: Dữ liệu gửi lên không hợp lệ.",
          payload
        );
        if (callback)
          callback({ status: "error", message: "Dữ liệu không hợp lệ." });
        return;
      }
      try {
        console.log(`[socketEvents.js] Bắt đầu lưu tin nhắn vào DB...`);
        const savedMessage = await saveMessageToDb(roomId, senderId, content);
        console.log(
          `[socketEvents.js] Lưu tin nhắn thành công. Message ID mới: ${savedMessage.id}`
        );

        // =====================================================================
        // === THÊM ĐOẠN LOG NÀY ĐỂ DEBUG ===
        // =====================================================================
        const clientsInRoom = io.sockets.adapter.rooms.get(roomId.toString());
        console.log(
          `[DEBUG] Các socket ID trong phòng ${roomId}:`,
          clientsInRoom
        );
        // =====================================================================

        console.log(
          `[socketEvents.js] <- Phát sự kiện 'new_chat_message' tới tất cả client trong phòng ${roomId}`
        );
        io.to(roomId.toString()).emit("new_chat_message", savedMessage);

        console.log(
          `[socketEvents.js] Cập nhật trạng thái đã đọc cho người gửi ${senderId}`
        );
        await updateLastReadMessage(roomId, senderId, savedMessage.id);

        if (callback) {
          console.log(
            `[socketEvents.js] Gửi callback thành công về cho client.`
          );
          callback({ status: "sent", messageId: savedMessage.id });
        }
      } catch (error) {
        console.error(
          `[socketEvents.js] Lỗi nghiêm trọng khi gửi tin nhắn phòng ${roomId}:`,
          error
        );
        if (callback)
          callback({
            status: "error",
            message: "Lỗi server khi gửi tin nhắn.",
          });
      }
    });
    // ...

    socket.on("mark_chat_as_read", async ({ roomId, messageId }, callback) => {
      console.log(
        `[socketEvents.js] -> Nhận sự kiện 'mark_chat_as_read' từ User ${socket.userId} cho phòng ${roomId}, đến tin nhắn ${messageId}`
      );
      if (!socket.userId || !roomId || !messageId) {
        console.error(
          "[socketEvents.js] Lỗi: Dữ liệu 'mark_chat_as_read' không hợp lệ."
        );
        if (callback)
          return callback({ success: false, message: "Dữ liệu không hợp lệ." });
        return;
      }
      try {
        await updateLastReadMessage(roomId, socket.userId, messageId);
        console.log(
          `[socketEvents.js] Cập nhật DB thành công cho 'mark_chat_as_read'.`
        );
        if (callback) callback({ success: true });
      } catch (error) {
        console.error(
          `[socketEvents.js] Lỗi khi cập nhật trạng thái đã đọc:`,
          error
        );
        if (callback)
          callback({
            success: false,
            message: "Không thể cập nhật trạng thái đọc.",
          });
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `[socketEvents.js] Client đã ngắt kết nối: Socket ID ${socket.id}, User ID: ${socket.userId}`
      );
      connectionManager.removeConnection(socket.id);
    });
  });
};

export default setupSocketEvents;
