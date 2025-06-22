import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Kết nối đến server Node.js
    const newSocket = io("http://localhost:3000"); // Địa chỉ server Node.js của bạn
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Node.js Socket.IO server");
    });

    // Lắng nghe sự kiện "message-sent" từ Node.js (tên sự kiện từ broadcastAs() của Laravel)
    newSocket.on("message-sent", (data) => {
      console.log("New message received:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Lắng nghe sự kiện thông báo (ví dụ, bạn có thể tạo một event khác trong Laravel)
    // newSocket.on('new-notification', (data) => {
    //     console.log('New notification received:', data);
    //     setNotifications(prevNotifications => [...prevNotifications, data]);
    // });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Node.js Socket.IO server");
    });

    // Cleanup khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Chat</h1>
      <div>
        <h2>Messages:</h2>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user.name}:</strong> {msg.message}
          </p>
        ))}
      </div>
      {/* <div>
                <h2>Notifications:</h2>
                {notifications.map((notif, index) => (
                    <p key={index}>{notif.title}: {notif.content}</p>
                ))}
            </div> */}
    </div>
  );
};

export default ChatComponent;
