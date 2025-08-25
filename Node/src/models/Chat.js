// src/models/Chat.js
import pool from "../../db.js";

async function saveMessageToDb(roomId, senderId, content) {
  let connection;
  console.log(
    `[Chat.js] Chuẩn bị lưu tin nhắn vào DB: Phòng ${roomId}, Người gửi ${senderId}`
  );
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO messages (chat_room_id, sender_id, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [roomId, senderId, content]
    );
    const messageId = result.insertId;
    console.log(
      `[Chat.js] Đã INSERT tin nhắn thành công, ID mới: ${messageId}`
    );

    console.log(`[Chat.js] Cập nhật timestamp cho phòng ${roomId}`);
    await connection.query(
      "UPDATE chat_rooms SET updated_at = NOW() WHERE id = ?",
      [roomId]
    );

    console.log(`[Chat.js] Lấy thông tin người gửi ${senderId}`);
    const [senderInfo] = await connection.query(
      `SELECT username AS sender_name, avatar_url AS sender_avatar FROM users WHERE id = ?`,
      [senderId]
    );

    console.log(`[Chat.js] Trả về đối tượng tin nhắn hoàn chỉnh.`);
    return {
      id: messageId,
      chat_room_id: parseInt(roomId),
      sender_id: senderId,
      content: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_name: senderInfo[0]?.sender_name,
      sender_avatar: senderInfo[0]?.sender_avatar,
    };
  } catch (error) {
    console.error("[Chat.js] Lỗi khi lưu tin nhắn vào DB:", error);
    throw new Error("Không thể lưu tin nhắn.");
  } finally {
    if (connection) connection.release();
  }
}

async function updateLastReadMessage(roomId, userId, messageId) {
  let connection;
  console.log(
    `[Chat.js] Chuẩn bị cập nhật trạng thái đã đọc: Phòng ${roomId}, User ${userId}, Tin nhắn ${messageId}`
  );
  try {
    connection = await pool.getConnection();
    await connection.query(
      `UPDATE chat_room_participants SET last_read_message_id = ? WHERE chat_room_id = ? AND user_id = ?`,
      [messageId, roomId, userId]
    );
    console.log(`[Chat.js] Cập nhật trạng thái đã đọc thành công.`);
  } catch (error) {
    console.error(`[Chat.js] Lỗi khi cập nhật last_read_message_id:`, error);
    throw new Error("Không thể cập nhật trạng thái đọc.");
  } finally {
    if (connection) connection.release();
  }
}

export { saveMessageToDb, updateLastReadMessage };
