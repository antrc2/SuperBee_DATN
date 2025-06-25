// src/models/ConnectionManager.js
// Quản lý các socket đang kết nối
class ConnectionManager {
  constructor() {
    this.connectedClients = {}; // { 'user_id': ['socket_id_1', 'socket_id_2', ...] }
    this.socketIdToUserId = {}; // { 'socket_id': 'user_id' }
    // Nếu bạn muốn hỗ trợ webId, bạn cần sửa đổi cấu trúc dữ liệu ở đây
    // Ví dụ: this.connectedClients = { 'user_id': [{ socketId: '...', webId: '...' }] }
    // và cập nhật addConnection/removeConnection/getSocketIdByWebId cho phù hợp.
  }

  addConnection(userId, socketId) {
    if (!this.connectedClients[userId]) {
      this.connectedClients[userId] = [];
    }
    if (!this.connectedClients[userId].includes(socketId)) {
      this.connectedClients[userId].push(socketId);
    }
    this.socketIdToUserId[socketId] = userId;

    console.log(
      `[ConnectionManager] Đã thêm kết nối: Người dùng ${userId}, Socket ID ${socketId}`
    );
  }

  removeConnection(socketId) {
    const userId = this.socketIdToUserId[socketId];
    if (userId && this.connectedClients[userId]) {
      this.connectedClients[userId] = this.connectedClients[userId].filter(
        (id) => id !== socketId
      );

      if (this.connectedClients[userId].length === 0) {
        delete this.connectedClients[userId];
      }
      delete this.socketIdToUserId[socketId];

      console.log(
        `[ConnectionManager] Đã xóa kết nối: Người dùng ${userId}, Socket ID ${socketId}`
      );
    }
  }

  getSocketIdsByUserId(userId) {
    return this.connectedClients[userId] || [];
  }

  // Phương thức getSocketIdByWebId cần được triển khai nếu muốn dùng
  // Nó cần thông tin webId được lưu khi addConnection
  getSocketIdByWebId(userId, webId) {
    // Hiện tại, ConnectionManager không lưu webId cùng socketId.
    // Để phương thức này hoạt động, bạn cần thay đổi cách `addConnection` lưu trữ dữ liệu.
    // Ví dụ: addConnection(userId, socketId, webId) và lưu { socketId: '...', webId: '...' }.
    console.warn(
      "[ConnectionManager] Phương thức getSocketIdByWebId được gọi nhưng ConnectionManager hiện chưa lưu trữ thông tin webId."
    );
    const userSockets = this.connectedClients[userId];
    if (userSockets) {
      // Giả định nếu bạn đã sửa addConnection để lưu { socketId, webId }
      // const found = userSockets.find(item => item.webId === webId);
      // return found ? found.socketId : undefined;
    }
    return undefined;
  }
}

export default new ConnectionManager();
