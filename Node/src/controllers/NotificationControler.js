import ConnectionManager from "../models/ConnectionManager";

function sendSocketNotification(io, notificationEventType, notificationData) {
  const userId = notificationData.user_id;

  //   if (userId) {
  //     // Đây là thông báo cá nhân (cho một hoặc nhiều phiên của cùng một người dùng)
  //     console.log(
  //       `[Socket Notif] Đang xử lý thông báo riêng tư cho người dùng: ${userId}, Event: ${notificationEventType}`
  //     );
  //     const socketIds = ConnectionManager.getSocketIdsByUserId(userId);

  //     if (socketIds.length > 0) {
  //       socketIds.forEach((socketId) => {
  //         // Gửi thông báo tới từng socket của người dùng đó
  //         io.to(socketId).emit(notificationEventType, notificationData);
  //       });
  //       console.log(
  //         `[Socket Notif] Đã gửi thông báo riêng tư '${notificationEventType}' tới TẤT CẢ các phiên của người dùng ${userId}.`
  //       );
  //     } else {
  //       console.log(`[Socket Notif] Người dùng ${userId} hiện không trực tuyến.`);
  //     }
  //   } else {
  //     // Đây là thông báo công khai (gửi tới tất cả client đang kết nối)
  //     console.log(
  //       `[Socket Notif] Đang xử lý thông báo công khai, Event: ${notificationEventType}`
  //     );
  //     io.emit(notificationEventType, notificationData);
  //     console.log(
  //       `[Socket Notif] Đã gửi thông báo công khai '${notificationEventType}' tới tất cả client đang kết nối.`
  //     );
  //   }
}

export { sendSocketNotification };
