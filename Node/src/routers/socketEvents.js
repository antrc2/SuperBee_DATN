// src/routers/socketEvents.js
import { verifyToken } from "../utils/jwt.js"; // Để giải mã JWT
import connectionManager from "../models/ConnectionManager.js"; // Để quản lý danh sách các kết nối
import { v4 as uuidv4 } from "uuid"; // Để tạo ID duy nhất cho người dùng khách

const ANONYMOUS_USER_ID_PREFIX = "guest_"; // Tiền tố cho các ID của người dùng chưa đăng nhập (khách)

// Hàm chính để thiết lập tất cả các sự kiện Socket.IO
const setupSocketEvents = (io) => {
  // --- Lắng nghe sự kiện "connection" (khi có client mới kết nối) ---
  io.on("connection", (socket) => {
    // Ngay khi một client kết nối, middleware 'auth.js' đã chạy trước đó
    // và đã gán 'socket.userId' và 'socket.isLoggedIn' cho socket này.
    console.log(
      `[SocketEvents] Client mới đã kết nối: ${socket.id}, ID người dùng: ${socket.userId}, Đã đăng nhập: ${socket.isLoggedIn}`
    );
    // Ví dụ về log ra:
    // [SocketEvents] Client mới đã kết nối: Abc123xyz, ID người dùng: guest_12345, Đã đăng nhập: false
    // HOẶC
    // [SocketEvents] Client mới đã kết nối: Def456uvw, ID người dùng: user_789, Đã đăng nhập: true

    // --- Gửi trạng thái xác thực ban đầu về phía Frontend (FE) ---
    // FE sẽ nhận được thông tin này ngay sau khi kết nối thành công để biết mình là ai
    socket.emit("authenticated", {
      success: socket.isAuthenticated, // Luôn là true ở đây vì middleware luôn gán một ID (khách hoặc người dùng)
      userId: socket.userId, // ID mà server đã gán cho socket này
      isLoggedIn: socket.isLoggedIn, // Trạng thái đăng nhập của người dùng
      message: socket.isLoggedIn
        ? "Kết nối ban đầu đã xác thực với ID người dùng."
        : "Kết nối ban đầu dưới dạng khách/người dùng tạm thời.",
    });
    // Ví dụ FE nhận: { success: true, userId: 'guest_12345', isLoggedIn: false, message: '...' }
    // HOẶC: { success: true, userId: 'user_789', isLoggedIn: true, message: '...' }

    // --- Lắng nghe sự kiện "authenticate" từ FE (khi client muốn xác thực lại hoặc nâng cấp quyền) ---
    socket.on("authenticate", (token) => {
      const previousUserId = socket.userId; // Lưu lại ID người dùng hiện tại của socket
      const previousIsLoggedIn = socket.isLoggedIn; // Lưu lại trạng thái đăng nhập hiện tại

      let newUserId; // ID người dùng mới sau khi xác thực lại
      let newIsLoggedIn = false; // Trạng thái đăng nhập mới
      let authMessage = "Xác thực lại thất bại: Token không hợp lệ."; // Thông báo mặc định nếu thất bại

      const decoded = token ? verifyToken(token) : null; // Giải mã token nếu có
      console.log("🚀 ~ socket.on ~ decoded:", decoded);

      // --- Logic xử lý token khi xác thực lại ---
      if (decoded && decoded.name) {
        // Nếu token hợp lệ và có trường 'sub' (ID người dùng)
        newUserId = decoded.name; // Lấy ID người dùng từ token
        newIsLoggedIn = true; // Người dùng đã đăng nhập
        authMessage = "Xác thực lại thành công.";
      } else {
        // Nếu token không hợp lệ (hết hạn, sai định dạng) hoặc không có token (trường hợp đăng xuất)
        // -> Hạ cấp người dùng về trạng thái khách hoặc giữ nguyên trạng thái khách hiện tại
        const currentGuestIdFromQuery = socket.handshake.query.guestId; // Lấy lại guestId từ lúc kết nối ban đầu
        newUserId = `${ANONYMOUS_USER_ID_PREFIX}${
          currentGuestIdFromQuery || uuidv4() // Dùng guestId cũ nếu có, không thì tạo mới
        }`;
        newIsLoggedIn = false; // Người dùng không đăng nhập (là khách)
        authMessage =
          "Không có hoặc token không hợp lệ. Đang trở lại/giữ trạng thái khách.";
        console.warn(
          `[SocketEvents] Xác thực lại thất bại cho socket ${socket.id}. Không có/token không hợp lệ. Đặt người dùng là ${newUserId}.`
        );
        // Ví dụ log: [SocketEvents] Xác thực lại thất bại cho socket Abc123xyz. Không có/token không hợp lệ. Đặt người dùng là guest_12345.
      }

      // --- Cập nhật ConnectionManager và thông tin socket nếu ID hoặc trạng thái đăng nhập thay đổi ---
      if (
        previousUserId !== newUserId ||
        previousIsLoggedIn !== newIsLoggedIn
      ) {
        // Nếu có sự thay đổi về ID người dùng hoặc trạng thái đăng nhập
        // Bước 1: Xóa kết nối này khỏi ID người dùng CŨ trong ConnectionManager
        connectionManager.removeConnection(socket.id);
        // Bước 2: Thêm kết nối này vào ID người dùng MỚI trong ConnectionManager
        connectionManager.addConnection(newUserId, socket.id);

        // Bước 3: Cập nhật ID người dùng và trạng thái đăng nhập trên chính đối tượng socket
        socket.userId = newUserId;
        socket.isLoggedIn = newIsLoggedIn;
        console.log(
          `[SocketEvents] Socket ${socket.id} đã cập nhật: ID người dùng thay đổi từ ${previousUserId} sang ${newUserId}, Đã đăng nhập: ${newIsLoggedIn}`
        );
        // Ví dụ log khi đăng nhập: [SocketEvents] Socket Abc123xyz đã cập nhật: ID người dùng thay đổi từ guest_12345 sang user_789, Đã đăng nhập: true
        // Ví dụ log khi đăng xuất: [SocketEvents] Socket user_789 đã cập nhật: ID người dùng thay đổi từ user_789 sang guest_12345, Đã đăng nhập: false
      } else {
        // Nếu ID người dùng và trạng thái đăng nhập không thay đổi (ví dụ: client gửi lại cùng token hợp lệ)
        console.log(
          `[SocketEvents] Socket ${socket.id} xác thực lại nhưng không có thay đổi về ID người dùng hoặc trạng thái đăng nhập.`
        );
      }

      // --- Gửi lại trạng thái xác thực về FE sau khi xử lý sự kiện "authenticate" ---
      socket.emit("authenticated", {
        success: true, // Luôn là true ở đây vì chúng ta luôn có thể gán một userId (guest hoặc user)
        userId: socket.userId, // ID người dùng hiện tại của socket
        isLoggedIn: socket.isLoggedIn, // Trạng thái đăng nhập hiện tại
        message: authMessage, // Thông báo kết quả xác thực
      });
      // Ví dụ FE nhận: { success: true, userId: 'user_789', isLoggedIn: true, message: 'Re-authenticated successfully.' }
      // HOẶNG: { success: true, userId: 'guest_12345', isLoggedIn: false, message: 'Invalid or no token provided...' }
    });

    // --- Lắng nghe sự kiện "disconnect" (khi client ngắt kết nối) ---
    socket.on("disconnect", () => {
      // Xóa socket này khỏi ConnectionManager khi nó ngắt kết nối
      connectionManager.removeConnection(socket.id);
      console.log(
        `[SocketEvents] Client đã ngắt kết nối: ${socket.id} (ID người dùng: ${socket.userId})`
      );
      // Ví dụ log: [SocketEvents] Client đã ngắt kết nối: Abc123xyz (ID người dùng: guest_12345)
    });

    // --- Lắng nghe sự kiện "send_chat_message" từ FE (khi client gửi tin nhắn chat) ---
    socket.on("send_chat_message", (messagePayload) => {
      // Kiểm tra quyền: Chỉ cho phép gửi chat nếu người dùng đã đăng nhập (không phải khách)
      if (!socket.isLoggedIn) {
        socket.emit("error", "Vui lòng đăng nhập để gửi tin nhắn.");
        console.warn(
          `[SocketEvents] Người dùng ${socket.userId} (chưa đăng nhập) đã cố gắng gửi tin nhắn chat.`
        );
        return; // Dừng xử lý nếu không có quyền
      }
      console.log(
        `[SocketEvents] Tin nhắn chat từ ${socket.userId}: ${messagePayload.content}`
      );
      // Ví dụ log: [SocketEvents] Tin nhắn chat từ user_789: Xin chào mọi người!

      // --- Gửi xác nhận về FE (để FE biết tin nhắn đã được server nhận) ---
      io.to(socket.id).emit("chat_message_ack", {
        status: "sent",
        messageId: messagePayload.id, // Gửi lại ID tin nhắn để FE biết tin nhắn nào được xác nhận
      });
      // Ví dụ FE nhận: { status: 'sent', messageId: 'msg123' }
    });
  });
};

export default setupSocketEvents; // Xuất hàm setupSocketEvents để server chính có thể sử dụng
