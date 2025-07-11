// src/pages/EmailVerification.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "@utils/http"; // Ensure this path is correct

import { getDecodedToken } from "../../../utils/tokenUtils"; // Ensure this path is correct
import { useAuth } from "@contexts/AuthContext";

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
    <div
      className="max-w-xl mx-auto my-16 p-10 rounded-2xl shadow-xl 
                 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 
                 border border-gray-200 text-center 
                 transform transition duration-300 ease-in-out hover:scale-105"
    >
      <h2 className="text-4xl font-extrabold text-purple-700 mb-8 font-sans-serif tracking-wide drop-shadow-sm">
        Xác Minh Email Của Bạn 💌
      </h2>

      {/* Message removed, only error display */}
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6 font-semibold text-lg animate-shake">
          {error}
        </p>
      )}

      {/* Loading state indicator - simplified */}
      {isLoading && !error && (
        <div className="flex items-center justify-center space-x-3 mt-8">
          <svg
            className="animate-spin h-8 w-8 text-purple-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xl font-semibold text-gray-700">
            Đang kiểm tra...
          </span>{" "}
          {/* Text changed */}
        </div>
      )}

      {/* Guidance message for errors */}
      {error && (
        <p className="mt-8 text-md text-gray-600">
          Vui lòng kiểm tra lại liên kết hoặc{" "}
          <Link to={"/activeAcc"}>
            <span className="text-purple-500 font-semibold cursor-pointer hover:underline">
              thử yêu cầu gửi lại email xác minh
            </span>
          </Link>
          nếu bạn gặp vấn đề.
        </p>
      )}
    </div>
  );
};

export default EmailVerification;
