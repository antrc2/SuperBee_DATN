// import pool from "../../db.js";
import pool from "../../db.js";
// const AGENT_STATUS = {
//     OFFLINE: 0,
//     AVAILABLE: 1,
//     BUSY: 2, // Đã đạt giới hạn chat hoặc đang trong trạng thái bận
//     AWAY: 3, // Vắng mặt tạm thời
// };

async function checkAgentStatus(userId) {
  let connection;
  try {
    connection = await pool.getConnection();
    // Tìm tư vấn viên trong bảng 'agents' dựa trên 'user_id'
    const [rows] = await connection.query(
      "SELECT * FROM agents WHERE user_id = ? LIMIT 1",
      [userId]
    );
    const agent = rows[0];

    if (!agent) {
      return { isAgent: false, agent: null, status: null, isAvailable: null };
    }

    // Xác định trạng thái khả dụng của tư vấn viên
    // Một tư vấn viên được coi là khả dụng nếu trạng thái là 'available' hoặc 'online'
    // và số cuộc trò chuyện hiện tại chưa đạt giới hạn tối đa.
    const isAvailable =
      (agent.status === "available" || agent.status === "online") &&
      agent.current_chats_count < agent.max_chats_limit;

    return {
      isAgent: true,
      agent: agent,
      status: agent.status,
      isAvailable: isAvailable,
    };
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái tư vấn viên:", error);
    throw new Error("Không thể kiểm tra trạng thái tư vấn viên.");
  } finally {
    if (connection) connection.release(); // Giải phóng kết nối
  }
}

/**
 * Lấy thông tin chi tiết của một tư vấn viên theo ID người dùng của họ.
 * @param {number} userId - ID người dùng của tư vấn viên.
 * @returns {Promise<object | null>} Đối tượng tư vấn viên nếu tìm thấy, ngược lại là null.
 */
async function getAgentDetails(userId) {
  let connection;
  try {
    connection = await pool.getConnection();
    // Lấy thông tin chi tiết của tư vấn viên từ bảng 'agents'
    const [rows] = await connection.query(
      "SELECT * FROM agents WHERE user_id = ? LIMIT 1",
      [userId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Lỗi khi truy xuất thông tin chi tiết tư vấn viên:", error);
    throw new Error("Không thể truy xuất thông tin chi tiết tư vấn viên.");
  } finally {
    if (connection) connection.release(); // Giải phóng kết nối
  }
}

/**
 * Kiểm tra xem phòng chat đã tồn tại cho một khách hàng cụ thể chưa.
 * Nếu đã tồn tại, trả về ID phòng và lịch sử tin nhắn.
 * Nếu chưa tồn tại, tạo phòng mới và trả về ID phòng cùng với mảng tin nhắn rỗng.
 * @param {number} customerId - ID người dùng của khách hàng.
 * @param {number | null} [assignedAgentUserId=null] - Tùy chọn: ID người dùng của tư vấn viên được chỉ định ban đầu.
 * @returns {Promise<{roomId: number, messages: Array<object>, message: string}>} Đối tượng chứa ID phòng, tin nhắn và thông báo.
 */
async function findOrCreateChatRoomForCustomer(
  customerId,
  assignedAgentUserId = null
) {
  let connection;
  try {
    connection = await pool.getConnection(); // Lấy một kết nối từ pool
    await connection.beginTransaction(); // Bắt đầu giao dịch

    let roomId;
    let messages = [];
    let statusMessage = "";

    // 1. Kiểm tra xem phòng chat đã tồn tại cho khách hàng này chưa
    // Tìm phòng chat mà khách hàng này là một 'customer' participant
    const [existingParticipantRows] = await connection.query(
      "SELECT chat_room_id FROM chat_room_participants WHERE user_id = ? AND role = ? LIMIT 1",
      [customerId, "customer"]
    );
    const existingParticipant = existingParticipantRows[0];

    if (existingParticipant) {
      roomId = existingParticipant.chat_room_id;
      statusMessage = "Đã tìm thấy phòng chat hiện có.";

      // Lấy tất cả tin nhắn của phòng chat này
      const [messageRows] = await connection.query(
        "SELECT id, chat_room_id, sender_id, content, attachment_url, created_at, updated_at FROM messages WHERE chat_room_id = ? ORDER BY created_at ASC",
        [roomId]
      );
      messages = messageRows;
    } else {
      // 2. Nếu không có phòng hiện có, tạo một phòng mới
      const [insertRoomResult] = await connection.query(
        "INSERT INTO chat_rooms (status, created_at, updated_at) VALUES (?, NOW(), NOW())",
        ["open"] // Trạng thái mặc định khi tạo phòng mới
      );

      if (!insertRoomResult || !insertRoomResult.insertId) {
        throw new Error("Không thể tạo phòng chat mới.");
      }
      roomId = insertRoomResult.insertId;
      statusMessage = "Đã tạo phòng chat mới thành công.";

      // 3. Thêm khách hàng vào bảng 'chat_room_participants' với vai trò 'customer'
      await connection.query(
        "INSERT INTO chat_room_participants (chat_room_id, user_id, role, joined_at, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW(), NOW())",
        [roomId, customerId, "customer"]
      );

      // 4. Nếu có tư vấn viên được chỉ định, thêm tư vấn viên vào phòng chat
      if (assignedAgentUserId) {
        // Tạm thời gọi hàm checkAgentStatus mà không dùng transaction connection
        // Vì checkAgentStatus tự lấy kết nối từ pool và giải phóng.
        // Nếu cần tích hợp chặt chẽ vào transaction này, cần truyền `connection` vào `checkAgentStatus`
        const agentStatus = await checkAgentStatus(assignedAgentUserId);

        if (agentStatus.isAgent && agentStatus.isAvailable) {
          // Thêm tư vấn viên vào bảng 'chat_room_participants' với vai trò 'agent'
          await connection.query(
            "INSERT INTO chat_room_participants (chat_room_id, user_id, role, joined_at, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW(), NOW())",
            [roomId, assignedAgentUserId, "agent"]
          );

          // Tăng số lượng chat hiện tại của tư vấn viên
          await connection.query(
            "UPDATE agents SET current_chats_count = current_chats_count + 1 WHERE user_id = ?",
            [assignedAgentUserId]
          );

          // Cập nhật trạng thái phòng chat nếu có tư vấn viên được gán
          await connection.query(
            "UPDATE chat_rooms SET status = ? WHERE id = ?",
            ["assigned", roomId] // hoặc 'active' tùy thuộc vào logic của bạn
          );

          statusMessage += ` Đã gán tư vấn viên ${assignedAgentUserId}.`;
        } else {
          console.warn(
            `Tư vấn viên ${assignedAgentUserId} không khả dụng hoặc không tồn tại. Phòng chat được tạo nhưng không gán tư vấn viên.`
          );
          statusMessage += " Phòng chat được tạo nhưng không gán tư vấn viên.";
          // Nếu không thể gán, có thể cập nhật trạng thái phòng là 'pending_assignment'
          await connection.query(
            "UPDATE chat_rooms SET status = ? WHERE id = ?",
            ["pending_assignment", roomId]
          );
        }
      } else {
        // Nếu không có tư vấn viên được chỉ định, phòng chat sẽ ở trạng thái chờ gán
        await connection.query(
          "UPDATE chat_rooms SET status = ? WHERE id = ?",
          ["pending_assignment", roomId]
        );
      }
    }

    await connection.commit(); // Hoàn tất giao dịch
    return { roomId: roomId, messages: messages, message: statusMessage };
  } catch (error) {
    if (connection) await connection.rollback(); // Hoàn tác giao dịch nếu có lỗi
    console.error("Lỗi trong findOrCreateChatRoomForCustomer:", error);
    throw new Error("Không thể quản lý phòng chat hoặc lịch sử tin nhắn.");
  } finally {
    if (connection) connection.release(); // Giải phóng kết nối
  }
}

// --- Ví dụ Sử Dụng (Để bạn có thể kiểm tra) ---

async function main() {
  try {
    // Giả sử có các user với ID 1 (là agent) và 2 (là customer)
    // Bạn cần đảm bảo các user này tồn tại trong bảng 'users' và 'agents'
    // Ví dụ tạo dữ liệu ảo để test nếu chưa có:
    // await pool.query('INSERT IGNORE INTO users (id, name) VALUES (1, "Agent User"), (2, "Customer User"), (3, "New Customer")');
    // await pool.query('INSERT IGNORE INTO agents (user_id, name, status, max_chats_limit) VALUES (1, "Agent 1", "available", 5)');

    const agentUserId = 1;
    const customerUserId = 2;

    // Kiểm tra trạng thái của tư vấn viên
    const agentStatus = await checkAgentStatus(agentUserId);
    console.log(`\nTrạng thái tư vấn viên ${agentUserId}:`, agentStatus);

    const agentDetails = await getAgentDetails(agentUserId);
    console.log(`Thông tin chi tiết tư vấn viên ${agentUserId}:`, agentDetails);

    // Tìm hoặc tạo phòng chat cho khách hàng 2, gán cho tư vấn viên 1
    console.log(
      "\n--- Thử nghiệm 1: Tìm hoặc tạo phòng chat cho Khách hàng 2, gán cho Tư vấn viên 1 ---"
    );
    const chatResult1 = await findOrCreateChatRoomForCustomer(
      customerUserId,
      agentUserId
    );
    console.log("Kết quả:", chatResult1);

    // Thử lại với cùng một khách hàng để kiểm tra việc tìm phòng chat hiện có
    console.log(
      "\n--- Thử nghiệm 2: Thử lại với cùng một Khách hàng 2 (phải tìm thấy phòng cũ) ---"
    );
    const chatResult2 = await findOrCreateChatRoomForCustomer(customerUserId);
    console.log("Kết quả:", chatResult2);

    // Thử tạo một phòng chat cho một khách hàng mới (ví dụ: ID 3) mà không gán tư vấn viên
    console.log(
      "\n--- Thử nghiệm 3: Tạo phòng chat cho Khách hàng mới 3 (không gán tư vấn viên) ---"
    );
    const newCustomerUserId = 3;
    const chatResult3 = await findOrCreateChatRoomForCustomer(
      newCustomerUserId
    );
    console.log("Kết quả:", chatResult3);
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm main:", error.message);
  } finally {
    // Đảm bảo đóng pool kết nối khi hoàn tất
    await pool.end();
    console.log("\nĐã đóng pool kết nối cơ sở dữ liệu.");
  }
}

// Bỏ comment dòng dưới để chạy ví dụ khi bạn đã cấu hình .env và có dữ liệu mẫu
// main();

// Export các hàm để sử dụng ở các module khác
export { checkAgentStatus, getAgentDetails, findOrCreateChatRoomForCustomer };
