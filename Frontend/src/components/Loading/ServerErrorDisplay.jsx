// src/components/ServerErrorDisplay.jsx

// Component để hiển thị thông báo lỗi server dựa trên status code
const ServerErrorDisplay = ({ statusCode }) => {
  let icon = "❓"; // Icon mặc định
  let message = "Đã xảy ra lỗi không xác định."; // Thông báo mặc định
  let title = "Lỗi không xác định"; // Tiêu đề mặc định

  switch (statusCode) {
    case 400:
      icon = "🚫";
      title = "Yêu cầu không hợp lệ";
      message =
        "Yêu cầu của bạn không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      break;
    case 401:
      icon = "🔒";
      title = "Không được phép";
      message =
        "Bạn không có quyền truy cập tài nguyên này. Vui lòng đăng nhập lại.";
      break;
    case 403:
      icon = "⛔";
      title = "Truy cập bị từ chối";
      message = "Bạn không được phép truy cập tài nguyên này.";
      break;
    case 404:
      icon = "🔍";
      title = "Không tìm thấy tài nguyên";
      message = "Tài nguyên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.";
      break;
    case 405:
      icon = "❌";
      title = "Phương thức không được phép";
      message = "Phương thức HTTP được yêu cầu không được phép.";
      break;
    case 429:
      icon = "⏰";
      title = "Quá nhiều yêu cầu";
      message =
        "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau.";
      break;
    case 500:
      icon = "🚨";
      title = "Lỗi máy chủ nội bộ";
      message = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.";
      break;
    case 502:
      icon = "🔌";
      title = "Bad Gateway";
      message =
        "Máy chủ không thể nhận phản hồi từ một máy chủ khác. Có thể do lỗi tạm thời.";
      break;
    case 503:
      icon = "🛠️";
      title = "Dịch vụ không khả dụng";
      message =
        "Máy chủ đang tạm thời không hoạt động (bảo trì hoặc quá tải). Vui lòng thử lại sau.";
      break;
    case 504:
      icon = "⏳";
      title = "Gateway Timeout";
      message =
        "Máy chủ không nhận được phản hồi kịp thời. Vui lòng kiểm tra kết nối mạng của bạn.";
      break;
    default:
      icon = "❓";
      title = "Lỗi không xác định";
      message = `Đã xảy ra lỗi không xác định (Mã lỗi: ${
        statusCode || "Không rõ"
      }). Vui lòng thử lại hoặc liên hệ hỗ trợ.`;
      break;
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px",
        margin: "20px auto",
        maxWidth: "500px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f8f8f8",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: "60px", marginBottom: "15px" }}>{statusCode}</div>
      <div style={{ fontSize: "60px", marginBottom: "15px" }}>{icon}</div>
      <h2 style={{ color: "#d32f2f", marginBottom: "10px" }}>{title}</h2>
      <p style={{ color: "#555", lineHeight: "1.6" }}>{message}</p>
      {/* Bạn có thể thêm nút "Thử lại" hoặc "Về trang chủ" ở đây */}
      {/* <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Thử lại
      </button> */}
    </div>
  );
};

export default ServerErrorDisplay;
