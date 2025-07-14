import React from "react";
import {
  AlertTriangle,
  ServerCrash,
  ShieldOff,
  Lock,
  SearchX,
  Timer,
  Wrench,
} from "lucide-react";

// Component để hiển thị thông báo lỗi server dựa trên status code
const ServerErrorDisplay = ({ statusCode }) => {
  let IconComponent = AlertTriangle;
  let title = "Lỗi không xác định";
  let message = `Đã xảy ra lỗi không xác định (Mã lỗi: ${
    statusCode || "Không rõ"
  }).`;

  switch (statusCode) {
    case 401:
      IconComponent = Lock;
      title = "Yêu cầu xác thực";
      message = "Bạn cần đăng nhập để thực hiện hành động này.";
      break;
    case 403:
      IconComponent = ShieldOff;
      title = "Truy cập bị từ chối";
      message = "Bạn không có quyền để truy cập tài nguyên này.";
      break;
    case 404:
      IconComponent = SearchX;
      title = "Không tìm thấy";
      message = "Tài nguyên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.";
      break;
    case 429:
      IconComponent = Timer;
      title = "Quá nhiều yêu cầu";
      message = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
      break;
    case 500:
      IconComponent = ServerCrash;
      title = "Lỗi máy chủ";
      message =
        "Máy chủ đang gặp sự cố. Chúng tôi đang khắc phục, vui lòng thử lại sau ít phút.";
      break;
    case 503:
      IconComponent = Wrench;
      title = "Dịch vụ bảo trì";
      message = "Hệ thống đang được bảo trì. Vui lòng quay lại sau.";
      break;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="relative text-center bg-dropdown backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-md w-full border border-themed">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl font-black font-heading text-accent/10 select-none">
            {statusCode}
          </span>
        </div>

        <div className="relative z-10">
          <IconComponent className="w-24 h-24 mx-auto mb-6 text-accent drop-shadow-lg" />
          <h2 className="text-3xl font-bold font-heading text-primary mb-3">
            {title}
          </h2>
          <p className="text-secondary leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorDisplay;
