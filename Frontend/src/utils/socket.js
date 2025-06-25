// src/services/socket.js
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

// Đảm bảo SOCKET_URL được định nghĩa trong môi trường của bạn (ví dụ: .env.local)
// Ví dụ: VITE_SOCKET_URL=http://localhost:3001
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";

// Sử dụng sessionStorage để guestId chỉ tồn tại trong phiên làm việc
const getGuestId = () => {
  let guestId = sessionStorage.getItem("guestId");
  if (!guestId) {
    const newGuestId = uuidv4();
    sessionStorage.setItem("guestId", newGuestId); // Lưu vào sessionStorage
    return newGuestId;
  }
  return guestId;
};

let socket = null;

// Hàm khởi tạo/lấy instance của socket
export const getSocket = (token = null) => {
  const currentGuestId = getGuestId();

  // Nếu socket chưa được khởi tạo HOẶC
  // Nếu socket đã tồn tại nhưng token hoặc guestId trong query khác với giá trị hiện tại
  if (
    !socket ||
    (socket.io.opts.query &&
      (socket.io.opts.query.token !== token ||
        socket.io.opts.query.guestId !== currentGuestId))
  ) {
    // Nếu socket đã tồn tại, ngắt kết nối cũ trước khi tạo mới
    if (socket) {
      console.log(
        "Socket: Token/GuestId thay đổi hoặc socket cần khởi tạo lại. Đang ngắt kết nối cũ."
      );
      socket.disconnect();
    }

    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      query: {
        token: token || "", // Luôn gửi token mới nhất
        guestId: currentGuestId, // Luôn gửi guestId mới nhất
      },
      autoConnect: false, // Vẫn tắt autoConnect để chúng ta chủ động kết nối
      reconnectionAttempts: 5, // Thử kết nối lại 5 lần
      reconnectionDelay: 1000, // Sau 1 giây
    });

    // --- Đăng ký các sự kiện socket cơ bản (chỉ một lần khi socket được tạo) ---
    socket.on("connect", () => {
      console.log("Socket Đã Kết Nối:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket Đã Ngắt Kết Nối:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Lỗi Kết Nối Socket:", err.message);
    });

    socket.on("error", (err) => {
      console.error("Lỗi Sự Kiện Socket Tùy Chỉnh:", err);
    });

    socket.on("authenticated", (response) => {
      if (response.success) {
        console.log(
          `Socket đã xác thực thành công cho người dùng ${
            response.userId || "ẩn danh"
          } (Đã đăng nhập: ${response.isLoggedIn})`
        );
      } else {
        console.warn("Xác thực Socket thất bại:", response.message);
      }
    });

    // Thêm log khi tạo socket mới
    console.log(
      "Socket: Instance mới đã được tạo hoặc cập nhật với query:",
      socket.io.opts.query
    );
  } else {
    console.log("Socket: Đã tồn tại và không cần cập nhật query params.");
  }

  return socket;
};

// Hàm kết nối socket một cách chủ động
export const connectSocket = (token) => {
  const s = getSocket(token); // Luôn lấy socket với token mới nhất
  if (!s.connected) {
    s.connect(); // Bắt đầu kết nối nếu chưa kết nối
    console.log("Socket: Đang cố gắng thiết lập kết nối...");
  } else {
    console.log("Socket: Đã kết nối. Không cần gọi connect() lại.");
  }
};

// Hàm gửi sự kiện xác thực lại (dùng khi đăng nhập/đăng xuất bằng API, không phải reload)
export const authenticateSocket = (jwtToken) => {
  const s = getSocket(jwtToken); // Đảm bảo socket đã được cấu hình với token này
  if (s && s.connected) {
    console.log(
      `Socket: Gửi sự kiện 'authenticate' với trạng thái token: ${
        jwtToken ? "có" : "rỗng"
      }`
    );
    s.emit("authenticate", jwtToken);
  } else {
    console.warn(
      "Socket: Chưa kết nối hoặc không tồn tại. Không thể gửi sự kiện 'authenticate' ngay lập tức."
    );
  }
};

// Hàm đóng kết nối socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Reset socket instance để có thể tạo mới sau này nếu cần
    console.log("Socket: Đã ngắt kết nối thủ công.");
  }
};
