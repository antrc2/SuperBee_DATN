// src/middleware/auth.js
import { verifyToken } from "../utils/jwt.js";
import connectionManager from "../models/ConnectionManager.js";
import { v4 as uuidv4 } from "uuid";

const ANONYMOUS_USER_ID_PREFIX = "guest_";

const authSocketMiddleware = (socket, next) => {
  console.log(
    `\n--- [auth.js] Middleware được kích hoạt cho kết nối mới, Socket ID: ${socket.id} ---`
  );
  const token = socket.handshake.query.token;
  const guestId = socket.handshake.query.guestId;

  let userId;
  let isLoggedIn = false;
  let userRole = "customer";

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.user_id) {
      userId = decoded.user_id.toString();
      isLoggedIn = true;
      userRole = decoded.role_ids?.[0] || "customer";
      console.log(
        `[auth.js] Kết nối được xác thực bằng JWT. User ID: ${userId}`
      );
    } else {
      userId = `${ANONYMOUS_USER_ID_PREFIX}${guestId || uuidv4()}`;
      console.warn(
        `[auth.js] Token không hợp lệ. Coi như người dùng khách. Guest ID: ${userId}`
      );
    }
  } else if (guestId) {
    userId = `${ANONYMOUS_USER_ID_PREFIX}${guestId}`;
    console.log(
      `[auth.js] Kết nối với tư cách người dùng khách. Guest ID: ${userId}`
    );
  } else {
    userId = `${ANONYMOUS_USER_ID_PREFIX}${uuidv4()}`;
    console.warn(
      `[auth.js] Không có token hoặc guestId. Tạo Guest ID tạm thời: ${userId}`
    );
  }

  socket.userId = userId;
  socket.isLoggedIn = isLoggedIn;
  socket.userRole = userRole;

  connectionManager.addConnection(socket.userId, socket.id);

  socket.join("public_notifications");
  console.log(
    `[auth.js] Socket ${socket.id} (User: ${socket.userId}) đã tự động tham gia phòng 'public_notifications'.`
  );

  console.log(
    `[auth.js] Middleware hoàn tất. Trạng thái Socket: UserID=${socket.userId}, IsLoggedIn=${socket.isLoggedIn}, Role=${socket.userRole}`
  );
  console.log(`--- Kết thúc middleware cho Socket ID: ${socket.id} ---\n`);

  next();
};

export default authSocketMiddleware;
