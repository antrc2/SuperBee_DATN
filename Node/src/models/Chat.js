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

    const [customerInfo] = await connection.query(
      `SELECT username, avatar_url FROM users WHERE id = ?`,
      [customerId]
    );

    if (existingRooms.length > 0) {
      // 2a. Nếu đã có, tải lại thông tin phòng và lịch sử tin nhắn
      const roomId = existingRooms[0].id;
      const [unreadResult] = await connection.query(
        `SELECT COUNT(m.id) AS unreadCount
     FROM messages AS m
     LEFT JOIN chat_room_participants p ON m.chat_room_id = p.chat_room_id AND p.user_id = ?
     WHERE m.chat_room_id = ?
       AND m.id > COALESCE(p.last_read_message_id, 0)
       AND m.sender_id != ?`, // Không đếm tin nhắn của chính họ
        [customerId, roomId, customerId]
      );
      const unreadCount = unreadResult[0].unreadCount;
      const [messages] = await connection.query(
        `SELECT m.*, u.username AS sender_name, u.avatar_url AS sender_avatar
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.chat_room_id = ? ORDER BY m.created_at ASC`,
        [roomId]
      );
      const [agentParticipant] = await connection.query(
        "SELECT user_id FROM chat_room_participants WHERE chat_room_id = ? AND role = 'agent'",
        [roomId]
      );

      let assignedAgentUserId = null;
      let agentDetails = null;

      if (agentParticipant.length > 0) {
        assignedAgentUserId = agentParticipant[0].user_id;
        const [agentRows] = await connection.query(
          `SELECT u.username AS agentName, u.avatar_url AS agentAvatar,
                  a.average_rating, a.total_ratings_count
           FROM users u
           JOIN agents a ON u.id = a.user_id
           WHERE u.id = ?`,
          [assignedAgentUserId]
        );
        if (agentRows.length > 0) {
          agentDetails = agentRows[0];
        }
      }

      await connection.commit();
      return {
        roomId,
        messages,
        message: "Đã tìm thấy phòng chat hiện có.",
        assignedAgentUserId,
        agentDetails, // Thêm thông tin agent vào đây
        unreadCount: unreadCount,
        customerName: customerInfo[0]?.username,
        customerAvatar: customerInfo[0]?.avatar_url,
      };
    } else {
      // 2b. Nếu chưa có, tạo phòng chat mới
      const [newRoomResult] = await connection.query(
        "INSERT INTO chat_rooms (name, status, created_at, updated_at) VALUES (?, 'open', NOW(), NOW())",
        [customerInfo[0]?.username || `Khách ${customerId}`]
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
      let agentDetails = null;

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

        const [agentRows] = await connection.query(
          `SELECT u.username AS agentName, u.avatar_url AS agentAvatar,
                  a.average_rating, a.total_ratings_count
           FROM users u
           JOIN agents a ON u.id = a.user_id
           WHERE u.id = ?`,
          [assignedAgentUserId]
        );
        if (agentRows.length > 0) {
          agentDetails = agentRows[0];
        }

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
        agentDetails, // Thêm thông tin agent vào đây
        unreadCount: 0,
        customerName: customerInfo[0]?.username,
        customerAvatar: customerInfo[0]?.avatar_url,
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

    // Lấy thông tin người gửi để trả về
    const [senderInfo] = await connection.query(
      `SELECT username AS sender_name, avatar_url AS sender_avatar FROM users WHERE id = ?`,
      [senderId]
    );

    const messageId = result.insertId;

    return {
      id: messageId,
      chat_room_id: roomId,
      sender_id: senderId,
      content: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_name: senderInfo[0]?.sender_name,
      sender_avatar: senderInfo[0]?.sender_avatar,
    };
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn vào DB:", error);
    throw new Error("Không thể lưu tin nhắn.");
  } finally {
    if (connection) connection.release();
  }
}

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
    const [chats] = await connection.query(
      `
      SELECT
        cr.id AS roomId,
        cr.status,
        cr.updated_at AS roomUpdatedAt,
        p_customer.user_id AS customerId,
        u_customer.username AS customerName,
        u_customer.avatar_url AS customerAvatar,
        (SELECT content FROM messages WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS lastMessage,
        (
          SELECT COUNT(m.id)
          FROM messages AS m
          WHERE
            m.chat_room_id = cr.id
            AND m.id > COALESCE(p_agent.last_read_message_id, 0)
            AND m.sender_id != ? -- Không tính tin nhắn do chính agent gửi
        ) AS unreadMessageCount
      FROM
        chat_room_participants AS p_agent
      JOIN
        chat_rooms AS cr ON p_agent.chat_room_id = cr.id
      JOIN
        users AS u_agent ON p_agent.user_id = u_agent.id
      LEFT JOIN
        chat_room_participants AS p_customer ON cr.id = p_customer.chat_room_id AND p_customer.role = 'customer'
      LEFT JOIN
        users AS u_customer ON p_customer.user_id = u_customer.id
      WHERE
        p_agent.user_id = ? AND p_agent.role = 'agent'
      ORDER BY
        cr.updated_at DESC;
      `,
      [agentId, agentId] // Truyền agentId 2 lần cho cả WHERE và subquery
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

    // 2. Lấy danh sách những người tham gia trong phòng cùng với thông tin user
    const [participants] = await connection.query(
      `SELECT crp.user_id, crp.role, crp.joined_at, u.username, u.avatar_url
       FROM chat_room_participants crp
       JOIN users u ON crp.user_id = u.id
       WHERE crp.chat_room_id = ?`,
      [roomId]
    );

    // 3. Lấy tất cả tin nhắn trong phòng, sắp xếp theo thời gian, kèm thông tin người gửi
    const [messages] = await connection.query(
      `SELECT m.*, u.username AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_room_id = ? ORDER BY m.created_at ASC`,
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

/**
 * Cập nhật tin nhắn cuối cùng đã đọc cho một người tham gia trong phòng chat.
 * @param {number} roomId ID của phòng chat.
 * @param {string} userId ID của người dùng.
 * @param {number} messageId ID của tin nhắn cuối cùng đã đọc.
 */
async function updateLastReadMessage(roomId, userId, messageId) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(
      `UPDATE chat_room_participants
       SET last_read_message_id = ?
       WHERE chat_room_id = ? AND user_id = ?`,
      [messageId, roomId, userId]
    );
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật last_read_message_id cho phòng ${roomId}, người dùng ${userId}:`,
      error
    );
    throw new Error("Không thể cập nhật trạng thái đọc.");
  } finally {
    if (connection) connection.release();
  }
}

// đánh dấu thông báo đã đọc
async function updateLastReadNotification(type, id) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(
      `UPDATE chat_room_participants
       SET last_read_message_id = ?
       WHERE chat_room_id = ? AND user_id = ?`,
      [messageId, roomId, userId]
    );
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật last_read_message_id cho phòng ${roomId}, người dùng ${userId}:`,
      error
    );
    throw new Error("Không thể cập nhật trạng thái đọc.");
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
  updateLastReadMessage, // Export hàm mới
};
