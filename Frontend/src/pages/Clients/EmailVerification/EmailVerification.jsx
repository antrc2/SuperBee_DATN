// src/pages/EmailVerification.js
import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "@utils/http"; // Ensure this path is correct

import { getDecodedToken } from "../../../utils/tokenUtils"; // Ensure this path is correct
import { useAuth } from "../../../contexts/AuthContext"; // Ensure this path is correct

const EmailVerification = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receivedToken = queryParams.get("token");
    if (receivedToken) {
      setToken(receivedToken);
      setMessage(
        "Chào mừng! Nhấn nút bên dưới để kích hoạt tài khoản của bạn."
      );
    } else {
      setError(
        "Không tìm thấy mã xác minh trong liên kết. Vui lòng kiểm tra lại đường dẫn."
      );
    }
  }, [location.search]);

  const handleVerifyEmail = useCallback(async () => {
    if (!token) {
      setError("Không có mã xác minh để thực hiện. Vui lòng tải lại trang.");
      return;
    }

    setIsLoading(true);
    setMessage("Đang xác minh tài khoản của bạn... ⏳"); // Animated text for processing
    setError("");

    try {
      const response = await api.get(`/verify-email?token=${token}`);
      console.log("🚀 ~ verifyEmail ~ response:", response);

      if (response?.data?.status === false) {
        throw new Error(
          response.data.message ||
            "Không nhận được access_token từ server email."
        );
      }

      // alert(response?.data?.message); // Removed alert for smoother UX
      const accessToken = response.data.access_token;

      sessionStorage.setItem("access_token", accessToken);

      const decoded = getDecodedToken();
      if (decoded) {
        setUser({ name: decoded.name, money: decoded.money });
        setMessage("Tài khoản của bạn đã được kích hoạt thành công! 🎉");
        setError(""); // Clear error message on success

        // Wait 3 seconds, then redirect
        setTimeout(() => {
          navigate("/"); // Redirect to home page
        }, 3000); // Wait 3 seconds
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
      setMessage(""); // Clear success message if there's an error
      // No redirection on error, keep user on page to see error
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
    }
  }, [token, navigate, setUser]);

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

      {/* Message and Error Display */}
      {message && (
        <p className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg relative mb-6 font-semibold text-lg animate-fade-in">
          {message}
        </p>
      )}
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6 font-semibold text-lg animate-shake">
          {error}
        </p>
      )}

      {/* Verification Button */}
      {token && !error && (
        <button
          onClick={handleVerifyEmail}
          disabled={isLoading}
          className={`w-full py-4 px-6 mt-8 rounded-lg font-bold text-white text-xl 
                     transition duration-300 ease-in-out transform 
                     ${
                       isLoading
                         ? "bg-purple-300 cursor-not-allowed flex items-center justify-center space-x-3"
                         : "bg-purple-500 hover:bg-purple-600 hover:scale-105 shadow-md hover:shadow-lg"
                     }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-6 w-6 text-white"
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
              <span>Đang xử lý...</span>
            </>
          ) : (
            "Kích Hoạt Tài Khoản Ngay! ✨"
          )}
        </button>
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
