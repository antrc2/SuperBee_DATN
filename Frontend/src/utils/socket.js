import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";

// Create guestId immediately when the page loads and save it to sessionStorage
export const initializeGuestId = () => {
  let guestId = sessionStorage.getItem("guestId");
  if (!guestId) {
    guestId = uuidv4();
    sessionStorage.setItem("guestId", guestId);
    console.log("Guest ID has been created:", guestId);
  }
  return guestId;
};

// Initialize guestId immediately when the module is imported
const GUEST_ID = initializeGuestId();

// Use sessionStorage so guestId only exists for the session
export const getGuestId = () => {
  return sessionStorage.getItem("guestId") || GUEST_ID;
};

let socket = null; // This variable will hold the single socket instance

// Function to initialize/get the socket instance
export const getSocket = () => {
  const currentGuestId = getGuestId();

  if (!socket) {
    console.log(
      "Socket: Creating a new instance with Guest ID:",
      currentGuestId
    );
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      // CHỈ GỬI GUESTID QUA QUERY BAN ĐẦU
      query: {
        guestId: currentGuestId, // Always send guestId for general notifications
      },
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // LOẠI BỎ TOKEN KHỎI AUTH CALLBACK Ở ĐÂY
      // Auth callback này vẫn cần thiết cho reconnect, nhưng sẽ không gửi token ban đầu
      auth: (cb) => {
        // Khi reconnect, nó vẫn gửi query params đã được thiết lập ban đầu (guestId)
        // và bạn sẽ dùng authenticateSocket() để gửi token sau
        cb({}); // Gửi một object rỗng, hoặc chỉ {} nếu bạn không muốn gửi thêm gì ở đây
      },
    });

    // --- Register basic socket events (only once when socket is created) ---
    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id); // [LOG MỚI]
      // Sau khi kết nối thành công, bạn có thể cân nhắc gọi authenticateSocket ở đây
      // nếu user đã đăng nhập nhưng socket vừa reconnect.
      // Tuy nhiên, ChatContext.jsx đã có useEffect để gọi authenticateSocket khi token thay đổi,
      // nên có thể không cần thiết gọi lại ở đây.
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket Disconnected:", reason); // [LOG MỚI]
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message); // [LOG MỚI]
    });

    socket.on("error", (err) => {
      console.error("Custom Socket Event Error:", err);
    });

    socket.on("authenticated", (response) => {
      if (response.success) {
        console.log(
          `Socket successfully authenticated for user ${
            response.userId || "anonymous"
          } (Logged in: ${response.isLoggedIn}). Server message: ${
            response.message
          }` // [LOG MỚI]
        );
      } else {
        console.warn(
          `Socket authentication failed: ${response.message}. IsLoggedIn: ${response.isLoggedIn}` // [LOG MỚI]
        );
      }
    });
  } else {
    console.log("Socket: Already exists, not creating again."); // [LOG MỚI]
  }

  return socket;
};

// Function to actively connect the socket
export const connectSocket = () => {
  const s = getSocket(); // Get the socket instance
  if (!s.connected) {
    s.connect(); // Start connection if not already connected
    console.log("Socket: Attempting to establish connection..."); // [LOG MỚI]
  } else {
    console.log("Socket: Already connected. No need to call connect() again."); // [LOG MỚI]
  }
};

// Function to send authentication event (e.g., when token changes)
export const authenticateSocket = (jwtToken) => {
  const s = getSocket(); // Get the socket instance
  if (s && s.connected) {
    console.log(
      `Socket: Emitting 'authenticate' event with token status: ${
        jwtToken ? "present" : "empty"
      }, token: ${jwtToken ? jwtToken.substring(0, 10) + "..." : "null"}` // [LOG MỚI]
    );
    s.emit("authenticate", jwtToken); // Send the token to the server for re-authentication
  } else {
    console.warn(
      "Socket: Not connected or does not exist. Cannot emit 'authenticate' immediately."
    );
    // If socket is not connected, try to connect and then authenticate
    if (s && !s.connected) {
      s.once("connect", () => {
        // Emit authenticate after successful connection
        s.emit("authenticate", jwtToken);
        console.log(
          `Socket: Connected and then emitted 'authenticate'. Token status: ${
            jwtToken ? "present" : "empty"
          }, token: ${jwtToken ? jwtToken.substring(0, 10) + "..." : "null"}` // [LOG MỚI]
        );
      });
      s.connect(); // Attempt to connect
    }
  }
};

// Function to close the socket connection
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket: Manually disconnected.");
  }
};

// Function to join a specific chat room (only for logged-in users)
export const joinChatRoom = (roomId, callback) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit("join_chat_room", { roomId }, callback);
  } else {
    console.warn("Socket not connected, cannot join chat room");
    if (callback) callback({ success: false, message: "Socket not connected" });
  }
};

// Function to leave a chat room
export const leaveChatRoom = (roomId, callback) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit("leave_chat_room", { roomId }, callback);
  } else {
    console.warn("Socket not connected, cannot leave chat room");
    if (callback) callback({ success: false, message: "Socket not connected" });
  }
};
