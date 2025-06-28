import pool from "../../db.js";

/**
 * Tìm một nhân viên đang rảnh rỗi dựa trên trạng thái và số lượng cuộc trò chuyện hiện tại.
 * @returns {Promise<string|null>} user_id của nhân viên hoặc null.
 */
async function getAvailableAgent() {
  let connection;
  try {
    connection = await pool.getConnection();
    // Ưu tiên nhân viên có ít cuộc trò chuyện nhất để cân bằng tải
    const [rows] = await connection.query(
      "SELECT user_id FROM agents WHERE status IN ('available', 'online') ORDER BY current_chats_count ASC LIMIT 1"
    );
    return rows.length > 0 ? rows[0].user_id : null;
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên khả dụng:", error);
    throw new Error("Không thể lấy nhân viên khả dụng.");
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Tìm phòng chat đang mở cho khách hàng, hoặc tạo một phòng mới và gán nhân viên.
 * @param {string} customerId ID của khách hàng.
 * @returns {Promise<object>} Dữ liệu phòng chat bao gồm ID phòng, tin nhắn, và nhân viên được gán.
 */
async function findOrCreateChatRoomForCustomer(customerId) {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Kiểm tra xem khách hàng đã có phòng chat nào đang hoạt động chưa
    const [existingRooms] = await connection.query(
      `SELECT cr.id FROM chat_rooms cr
       JOIN chat_room_participants p ON cr.id = p.chat_room_id
       WHERE p.user_id = ? AND p.role = 'customer' AND cr.status IN ('open', 'assigned', 'pending_assignment')
       LIMIT 1`,
      [customerId]
    );

    if (existingRooms.length > 0) {
      // 2a. Nếu đã có, tải lại thông tin phòng và lịch sử tin nhắn
      const roomId = existingRooms[0].id;
      const [messages] = await connection.query(
        "SELECT * FROM messages WHERE chat_room_id = ? ORDER BY created_at ASC",
        [roomId]
      );
      const [agent] = await connection.query(
        "SELECT user_id FROM chat_room_participants WHERE chat_room_id = ? AND role = 'agent'",
        [roomId]
      );

      await connection.commit();
      return {
        roomId,
        messages,
        message: "Đã tìm thấy phòng chat hiện có.",
        assignedAgentUserId: agent.length > 0 ? agent[0].user_id : null,
      };
    } else {
      // 2b. Nếu chưa có, tạo phòng chat mới
      const [newRoomResult] = await connection.query(
        "INSERT INTO chat_rooms (status, created_at, updated_at) VALUES ('open', NOW(), NOW())"
      );
      const roomId = newRoomResult.insertId;

      // Thêm khách hàng vào phòng
      await connection.query(
        "INSERT INTO chat_room_participants (chat_room_id, user_id, role) VALUES (?, ?, 'customer')",
        [roomId, customerId]
      );

      // 3. Tìm và gán nhân viên
      const assignedAgentUserId = await getAvailableAgent();
      let statusMessage = "Đã tạo phòng chat mới.";

      if (assignedAgentUserId) {
        // Gán nhân viên vào phòng
        await connection.query(
          "INSERT INTO chat_room_participants (chat_room_id, user_id, role) VALUES (?, ?, 'agent')",
          [roomId, assignedAgentUserId]
        );
        // Tăng số lượng chat của nhân viên
        await connection.query(
          "UPDATE agents SET current_chats_count = current_chats_count + 1 WHERE user_id = ?",
          [assignedAgentUserId]
        );
        // Cập nhật trạng thái phòng
        await connection.query(
          "UPDATE chat_rooms SET status = 'assigned' WHERE id = ?",
          [roomId]
        );
        statusMessage += ` Đã gán nhân viên ${assignedAgentUserId}.`;
      } else {
        // Nếu không có nhân viên, đưa vào hàng chờ
        await connection.query(
          "UPDATE chat_rooms SET status = 'pending_assignment' WHERE id = ?",
          [roomId]
        );
        statusMessage += " Không có nhân viên khả dụng, vui lòng chờ.";
      }
      await connection.commit();
      return {
        roomId,
        messages: [], // Phòng mới chưa có tin nhắn
        message: statusMessage,
        assignedAgentUserId,
      };
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Lỗi trong findOrCreateChatRoomForCustomer:", error);
    throw new Error("Không thể quản lý phòng chat.");
  } finally {
    if (connection) connection.release();
  }
}

async function saveMessageToDb(roomId, senderId, content) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO messages (chat_room_id, sender_id, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [roomId, senderId, content]
    );

    // Cập nhật updated_at của phòng chat để biết có hoạt động mới
    await connection.query(
      "UPDATE chat_rooms SET updated_at = NOW() WHERE id = ?",
      [roomId]
    );

    const messageId = result.insertId;

    return {
      id: messageId,
      chat_room_id: roomId,
      sender_id: senderId,
      content: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn vào DB:", error);
    throw new Error("Không thể lưu tin nhắn.");
  } finally {
    if (connection) connection.release();
  }
}

// ===============================================================
// PHẦN CODE MỚI THÊM CHO CHỨC NĂNG ADMIN
// ===============================================================

/**
 * Lấy danh sách các cuộc trò chuyện của một nhân viên cụ thể.
 * Rất hữu ích cho trang admin để xem công việc của từng nhân viên.
 * @param {number | string} agentId ID của nhân viên.
 * @returns {Promise<Array<object>>} Một mảng các object chứa thông tin tóm tắt về mỗi cuộc trò chuyện.
 */
async function getChatsByAgent(agentId) {
  let connection;
  try {
    connection = await pool.getConnection();
    // Câu lệnh SQL này sẽ:
    // 1. Tìm tất cả các `chat_room_id` mà nhân viên (agent) đã tham gia.
    // 2. JOIN với bảng `chat_rooms` để lấy trạng thái và thời gian tạo phòng.
    // 3. LEFT JOIN với `chat_room_participants` một lần nữa để tìm khách hàng (customer) trong cùng phòng chat.
    // 4. Dùng subquery để lấy tin nhắn cuối cùng, giúp admin có cái nhìn tổng quan nhanh.
    // 5. Sắp xếp theo thời gian cập nhật của phòng chat để cuộc trò chuyện mới nhất nổi lên trên.
    const [chats] = await connection.query(
      `
      SELECT
        cr.id AS roomId,
        cr.status,
        cr.created_at AS roomCreatedAt,
        cr.updated_at AS roomUpdatedAt,
        p_customer.user_id AS customerId,
        (SELECT content FROM messages WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS lastMessage
      FROM
        chat_room_participants AS p_agent
      JOIN
        chat_rooms AS cr ON p_agent.chat_room_id = cr.id
      LEFT JOIN
        chat_room_participants AS p_customer ON cr.id = p_customer.chat_room_id AND p_customer.role = 'customer'
      WHERE
        p_agent.user_id = ? AND p_agent.role = 'agent'
      ORDER BY
        cr.updated_at DESC;
      `,
      [agentId]
    );
    return chats;
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách chat cho nhân viên ${agentId}:`,
      error
    );
    throw new Error("Không thể lấy danh sách cuộc trò chuyện.");
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Lấy thông tin chi tiết và toàn bộ tin nhắn của một phòng chat cụ thể.
 * @param {number} roomId ID của phòng chat.
 * @returns {Promise<object|null>} Một object chứa thông tin chi tiết phòng, người tham gia và tin nhắn, hoặc null nếu không tìm thấy.
 */
async function getChatDetails(roomId) {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Lấy thông tin cơ bản của phòng chat
    const [roomRows] = await connection.query(
      "SELECT * FROM chat_rooms WHERE id = ?",
      [roomId]
    );
    if (roomRows.length === 0) {
      return null; // Không tìm thấy phòng chat
    }
    const roomInfo = roomRows[0];

    // 2. Lấy danh sách những người tham gia trong phòng
    const [participants] = await connection.query(
      "SELECT user_id, role, joined_at FROM chat_room_participants WHERE chat_room_id = ?",
      [roomId]
    );

    // 3. Lấy tất cả tin nhắn trong phòng, sắp xếp theo thời gian
    const [messages] = await connection.query(
      "SELECT * FROM messages WHERE chat_room_id = ? ORDER BY created_at ASC",
      [roomId]
    );

    return {
      roomInfo,
      participants,
      messages,
    };
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết chat cho phòng ${roomId}:`, error);
    throw new Error("Không thể lấy chi tiết cuộc trò chuyện.");
  } finally {
    if (connection) connection.release();
  }
}

// Export tất cả các hàm, bao gồm cả các hàm mới
export {
  findOrCreateChatRoomForCustomer,
  getAvailableAgent,
  saveMessageToDb,
  getChatsByAgent,
  getChatDetails,
};
