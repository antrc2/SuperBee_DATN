// src/middleware/auth.js
import { verifyToken } from "../utils/jwt.js";
import connectionManager from "../models/ConnectionManager.js";
import { v4 as uuidv4 } from "uuid";

const ANONYMOUS_USER_ID_PREFIX = "guest_";

const authSocketMiddleware = (socket, next) => {
  const token = socket.handshake.query.token;
  const guestId = socket.handshake.query.guestId;

  let userId;
  let isLoggedIn = false;
  let userRole = "customer";

  // Phân tích:
  // Lần đầu kết nối: `token` sẽ là `undefined` hoặc `""`, `guestId` sẽ có giá trị.
  // --> Sẽ chạy vào `else if (guestId)`
  // Khi user đăng nhập và `authenticateSocket` được gọi: `token` sẽ được gửi qua event 'authenticate',
  // không phải qua handshake query này nữa. `authSocketMiddleware` chỉ chạy 1 lần khi kết nối.

  if (token) {
    // Sẽ KHÔNG chạy ở kết nối ban đầu sau thay đổi ở client
    const decoded = verifyToken(token);
    console.log("🚀 ~ authSocketMiddleware ~ decoded:", decoded);
    if (decoded && decoded.user_id) {
      userId = decoded.user_id.toString();
      isLoggedIn = true;
      userRole = decoded.role_ids[0];
      console.log(
        `[Middleware] Socket ${socket.id}: Đã xác thực bằng JWT cho người dùng ${userId}`
      );
    } else {
      console.warn(
        `[Middleware] Socket ${socket.id}: Token không hợp lệ hoặc đã hết hạn. Chuyển về trạng thái khách.`
      );
      userId = `${ANONYMOUS_USER_ID_PREFIX}${guestId || uuidv4()}`;
      isLoggedIn = false;
    }
  } else if (guestId) {
    // Sẽ chạy ở kết nối ban đầu
    userId = `${ANONYMOUS_USER_ID_PREFIX}${guestId}`;
    isLoggedIn = false;
    userRole = "customer";
    console.log(
      `[Middleware] Socket ${socket.id}: Đã kết nối với tư cách khách, ID: ${userId}`
    );
  } else {
    // Chỉ chạy nếu không có cả token và guestId (rất hiếm)
    userId = `${ANONYMOUS_USER_ID_PREFIX}${uuidv4()}`;
    isLoggedIn = false;
    userRole = "customer";
    console.warn(
      `[Middleware] Socket ${socket.id}: Không có token hoặc guestId. Đã gán ID khách tạm thời: ${userId}`
    );
  }

  socket.userId = userId;
  socket.isLoggedIn = isLoggedIn;
  socket.isAuthenticated = true; // Luôn là true vì socket luôn có một định danh
  socket.userRole = userRole;
  connectionManager.addConnection(socket.userId, socket.id); // Liên kết userId (là guestId ban đầu) với socketId
  console.log(
    `[Middleware] Kết nối Socket ${socket.id} đã khởi tạo: ID Người dùng=${socket.userId}, Đã đăng nhập=${socket.isLoggedIn}`
  );

  socket.join("public_notifications");
  console.log(
    `[Middleware] Socket ${socket.id} (User: ${socket.userId}) đã tự động tham gia public_notifications.`
  );

  next();
};

export default authSocketMiddleware;
