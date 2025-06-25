import { verifyToken } from "../utils/jwt.js";
import connectionManager from "../models/ConnectionManager.js";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4 để tạo ID ngẫu nhiên

const ANONYMOUS_USER_ID_PREFIX = "guest_"; // Tiền tố cho người dùng khách

// Middleware để xác thực và thiết lập thông tin ban đầu cho mỗi socket
const authSocketMiddleware = (socket, next) => {
  const token = socket.handshake.query.token; // Lấy token từ tham số truy vấn khi kết nối
  const guestId = socket.handshake.query.guestId; // Lấy guestId từ tham số truy vấn khi kết nối

  let userId; // Biến để lưu ID người dùng hoặc ID khách
  let isLoggedIn = false; // Cờ để chỉ rõ người dùng đã đăng nhập (true) hay là khách (false)

  if (token) {
    // Nếu có token được gửi lên
    const decoded = verifyToken(token); // Giải mã token
    console.log("🚀 ~ authSocketMiddleware ~ decoded:", decoded);

    if (decoded && decoded.name) {
      // Nếu token hợp lệ và có trường 'name' (thường là ID người dùng hoặc username)
      userId = decoded.name; // Gán ID người dùng từ token
      isLoggedIn = true; // Đánh dấu là đã đăng nhập
      console.log(
        `[Middleware] Socket ${socket.id}: Đã xác thực bằng JWT cho người dùng ${userId}`
      );
    } else {
      // Nếu token không hợp lệ hoặc đã hết hạn
      console.warn(
        `[Middleware] Socket ${socket.id}: Token không hợp lệ hoặc đã hết hạn. Chuyển về trạng thái khách.`
      );
      // Gán userId là guestId từ FE, hoặc tạo một guestId mới nếu không có
      userId = `${ANONYMOUS_USER_ID_PREFIX}${guestId || uuidv4()}`;
      isLoggedIn = false; // Không đăng nhập
    }
  } else if (guestId) {
    // Nếu không có token nhưng có guestId từ Frontend
    userId = `${ANONYMOUS_USER_ID_PREFIX}${guestId}`; // Gán userId là guestId
    isLoggedIn = false; // Là khách, không phải đăng nhập
    console.log(
      `[Middleware] Socket ${socket.id}: Đã kết nối với tư cách khách, ID: ${userId}`
    );
  } else {
    // Nếu không có cả token và guestId
    // Gán một guestId ngẫu nhiên tạm thời cho socket này
    userId = `${ANONYMOUS_USER_ID_PREFIX}${uuidv4()}`;
    isLoggedIn = false; // Không đăng nhập
    console.warn(
      `[Middleware] Socket ${socket.id}: Không có token hoặc guestId. Đã gán ID khách tạm thời: ${userId}`
    );
  }

  // Lưu userId và trạng thái đăng nhập vào đối tượng socket
  // Điều này giúp bạn dễ dàng truy cập thông tin này trong các sự kiện khác của socket
  socket.userId = userId;
  socket.isLoggedIn = isLoggedIn; // Cờ này quan trọng để phân quyền
  // socket.isAuthenticated luôn là true vì socket luôn có một định danh (dù là khách hay người dùng)
  socket.isAuthenticated = true;

  // Thêm kết nối này vào ConnectionManager
  // ConnectionManager sẽ theo dõi mối liên hệ giữa userId và socket.id
  connectionManager.addConnection(socket.userId, socket.id);
  console.log(
    `[Middleware] Kết nối Socket ${socket.id} đã khởi tạo: ID Người dùng=${socket.userId}, Đã đăng nhập=${socket.isLoggedIn}`
  );

  next(); // Cho phép kết nối tiếp tục đến các sự kiện Socket.IO khác
};

export default authSocketMiddleware;
