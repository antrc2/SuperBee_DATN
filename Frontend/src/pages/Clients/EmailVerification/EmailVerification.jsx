// src/pages/EmailVerification.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "@utils/http"; // Ensure this path is correct

import { getDecodedToken } from "../../../utils/tokenUtils"; // Ensure this path is correct
import { useAuth } from "@contexts/AuthContext";
import { MailCheck, MailWarning } from "lucide-react";
import AuthCardLayout from "../../../layouts/AuthCardLayout";

const EmailVerification = () => {
  const [error, setError] = useState(""); // Chỉ giữ lại state cho lỗi
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Vẫn giữ isLoading để ẩn nút nếu có
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Sử dụng useRef để lưu trữ trạng thái đã gửi yêu cầu hay chưa
  const isVerificationAttempted = useRef(false);

  const handleVerifyEmail = useCallback(
    async (verificationToken) => {
      // Kiểm tra xem đã cố gắng xác minh trước đó chưa
      if (isVerificationAttempted.current) {
        console.log("Xác minh đã được thử, bỏ qua yêu cầu trùng lặp.");
        return;
      }

      if (!verificationToken) {
        setError("Không có mã xác minh để thực hiện. Vui lòng tải lại trang.");
        return;
      }

      // Đánh dấu là đã bắt đầu cố gắng xác minh
      isVerificationAttempted.current = true;
      setIsLoading(true);
      setError(""); // Clear any previous error before starting

      try {
        const response = await api.get(
          `/verify-email?token=${verificationToken}`
        );

        if (response?.data?.status === false) {
          throw new Error(
            response.data.message ||
              "Không nhận được access_token từ server email."
          );
        }

        const accessToken = response.data.access_token;
        sessionStorage.setItem("access_token", accessToken);

        const decoded = getDecodedToken();
        if (decoded) {
          setUser({
            name: decoded.name,
            money: decoded.money,
            avatar: decoded.avatar,
            donate_code: decoded.donate_code,
          });
          navigate("/");
        } else {
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
      } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
      }
    },
    [navigate, setUser]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receivedToken = queryParams.get("token");
    if (receivedToken) {
      setToken(receivedToken);
      // Gọi hàm xác minh email chỉ khi chưa được gọi trước đó
      if (!isVerificationAttempted.current) {
        handleVerifyEmail(receivedToken);
      }
    } else {
      setError(
        "Không tìm thấy mã xác minh trong liên kết. Vui lòng kiểm tra lại đường dẫn."
      );
    }
  }, [location.search, handleVerifyEmail]);

  return (
    <AuthCardLayout
      title="Xác minh Email"
      icon={isLoading ? MailCheck : MailWarning}
    >
      <div className="text-center">
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center space-y-4 my-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold text-secondary">
              Đang kiểm tra...
            </span>
          </div>
        )}
        {error && (
          <>
            <div className="alert alert-danger">{error}</div>
            <p className="mt-6 text-sm text-secondary">
              Vui lòng kiểm tra lại liên kết hoặc{" "}
              <Link
                to="/activeAcc"
                className="font-semibold text-accent hover:underline"
              >
                yêu cầu gửi lại email xác minh
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </AuthCardLayout>
  );
};

export default EmailVerification;
