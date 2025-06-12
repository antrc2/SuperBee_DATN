// src/pages/EmailVerification.js
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@utils/http"; // Đảm bảo đường dẫn này đúng
import { showNotification } from "../../../utils/notification"; // Đảm bảo đường dẫn này đúng
import { getDecodedToken } from "../../../utils/tokenUtils"; // Đảm bảo đường dẫn này đúng
import { useAuth } from "../../../contexts/AuthContext"; // Đảm bảo đường dẫn này đúng

const EmailVerification = () => {
  const [message, setMessage] = useState(""); // Ban đầu không có message
  const [error, setError] = useState("");
  const [token, setToken] = useState(null); // Lưu token từ URL
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading cho nút
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Destructure setUser from useAuth

  // Lấy token từ URL khi component được mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receivedToken = queryParams.get("token");
    if (receivedToken) {
      setToken(receivedToken);
      setMessage("Vui lòng nhấn nút bên dưới để kích hoạt tài khoản của bạn.");
    } else {
      setError("Không tìm thấy mã xác minh trong liên kết.");
    }
  }, [location.search]);

  // Hàm xử lý khi người dùng nhấn nút xác minh
  const handleVerifyEmail = useCallback(async () => {
    if (!token) {
      setError("Không có mã xác minh để thực hiện.");
      return;
    }

    setIsLoading(true); // Bắt đầu loading
    setMessage("Đang xác minh tài khoản của bạn..."); // Hiển thị trạng thái đang xử lý
    setError(""); // Xóa lỗi cũ

    try {
      const response = await api.get(`/verify-email?token=${token}`);
      console.log("🚀 ~ verifyEmail ~ response:", response);

      // Kiểm tra trạng thái false nếu backend trả về (đây là một check tùy chỉnh của bạn)
      if (response?.data?.status === false) {
        throw new Error(
          response.data.message ||
            "Không nhận được access_token từ server email."
        );
      }

      showNotification("info", response?.data?.message, 3000);
      const accessToken = response.data.access_token;

      // Lưu access_token vào sessionStorage
      sessionStorage.setItem("access_token", accessToken);
      // Tùy chọn: Nếu bạn có refresh_token từ API, hãy lưu nó vào localStorage hoặc sessionStorage
      // sessionStorage.setItem("refresh_token", response.data.refresh_token);

      const decoded = getDecodedToken(); // Sử dụng hàm đã tách
      if (decoded) {
        setUser({ name: decoded.name, money: decoded.money }); // Cập nhật trạng thái user
        setMessage("Tài khoản của bạn đã được kích hoạt thành công!");
        setError(""); // Clear error message on success
        setTimeout(() => {
          navigate("/"); // Điều hướng về trang chính sau khi đăng nhập thành công
        }, 2000); // Đợi 2 giây để người dùng đọc thông báo
      } else {
        // Nếu token không giải mã được sau khi nhận từ API
        throw new Error(
          "Không thể giải mã token từ phản hồi server. Vui lòng thử lại."
        );
      }
    } catch (err) {
      console.log("🚀 ~ verifyEmail ~ err:", err);
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || "Đã xảy ra lỗi khi xác minh email."
        );
      } else {
        setError(
          "Không thể kết nối đến máy chủ để xác minh email. Vui lòng kiểm tra kết nối của bạn."
        );
      }
      setMessage(""); // Clear success message if there's an error
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  }, [token, navigate, setUser]); // Thêm navigate và setUser vào dependencies

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        textAlign: "center",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
      }}
    >
      <h2>Xác minh Email</h2>

      {/* Hiển thị thông báo hoặc lỗi */}
      {message && (
        <p style={{ color: "blue", fontWeight: "bold" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {/* Nút xác minh chỉ hiển thị khi có token và không có lỗi nghiêm trọng */}
      {token && !error && (
        <button
          onClick={handleVerifyEmail}
          disabled={isLoading} // Vô hiệu hóa nút khi đang tải
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isLoading ? "#cccccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: "20px"
          }}
        >
          {isLoading ? "Đang xử lý..." : "Xác minh Tài khoản"}
        </button>
      )}

      {/* Thông báo hướng dẫn khi có lỗi */}
      {error && (
        <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
          Vui lòng kiểm tra lại liên kết hoặc thử yêu cầu gửi lại email xác minh
          nếu bạn gặp vấn đề.
        </p>
      )}
    </div>
  );
};

export default EmailVerification;
