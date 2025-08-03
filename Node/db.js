import mysql from "mysql2/promise.js";
import dotenv from "dotenv";
dotenv.config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Kiểm tra kết nối
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Kết nối cơ sở dữ liệu thành công!");
    connection.release(); // Giải phóng kết nối ngay lập tức sau khi kiểm tra
  } catch (error) {
    console.error("Lỗi kết nối cơ sở dữ liệu:", error.message);
    // Tùy chọn: thoát ứng dụng nếu không thể kết nối DB
    // process.exit(1);
  }
}

testDbConnection(); // Gọi hàm kiểm tra khi khởi động ứng dụng

export default pool;
