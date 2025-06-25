// src/Demo.js (hoặc một component Layout/Header)
// import React, { useState, useEffect } from "react";
// import useSocketNotifications from "../../hooks/useSocketNotifications";
// import NotificationList from "@components/NotificationList"; // Component để hiển thị thông báo

function Demo() {
  // const [loggedIn, setLoggedIn] = useState(false);
  // const [jwtToken, setJwtToken] = useState(null);
  // const nodeJsSocketUrl = "http://localhost:3001"; // URL của Node.js server

  // // Giả lập trạng thái đăng nhập và JWT Token sau khi người dùng đăng nhập
  // useEffect(() => {
  //   // Trong ứng dụng thực tế, bạn sẽ lấy JWT từ API đăng nhập của Laravel
  //   const storedToken = localStorage.getItem("jwt_token");
  //   if (storedToken) {
  //     setJwtToken(storedToken);
  //     setLoggedIn(true);
  //   }
  // }, []);

  // // Sử dụng custom hook để quản lý notifications
  // const { socket, notifications } = useSocketNotifications(
  //   nodeJsSocketUrl,
  //   loggedIn,
  //   jwtToken
  // );

  // const handleLogin = () => {
  //   // Giả lập đăng nhập: lấy token từ Laravel và lưu vào localStorage
  //   // Ví dụ: axios.post('/api/login', credentials).then(res => { localStorage.setItem('jwt_token', res.data.token); ... })
  //   const dummyToken =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.g7sNf13_b9G_3_2_5_8_4_6_0_1_2_3_4_5_6_7_8_9_0_1_2_3_4_5_6_7_8_9_0"; // Thay bằng token thật
  //   localStorage.setItem("jwt_token", dummyToken);
  //   setJwtToken(dummyToken);
  //   setLoggedIn(true);
  //   console.log("Logged in and JWT set.");
  // };

  // const handleLogout = () => {
  //   localStorage.removeItem("jwt_token");
  //   setJwtToken(null);
  //   setLoggedIn(false);
  //   console.log("Logged out.");
  // };

  return (
    <div className="App">
      <h1>Web Bán Acc Game</h1>
      {/* {loggedIn ? (
        <div>
          <p>Chào mừng, bạn đã đăng nhập!</p>
          <button onClick={handleLogout}>Đăng xuất</button>
          <NotificationList notifications={notifications} />
        </div>
      ) : (
        <div>
          <p>Bạn chưa đăng nhập.</p>
          <button onClick={handleLogin}>Đăng nhập (Giả lập)</button>
        </div>
      )} */}
      {/* Các phần khác của ứng dụng ReactJS */}
    </div>
  );
}

export default Demo;
