// src/pages/ActiveAcc.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you are using react-router-dom
import api from "@utils/http";

const ActiveAcc = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false); // New state for sending animation
  const navigate = useNavigate(); // For redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSending(true); // Start sending animation

    try {
      const response = await api.post("/sendActiveAccount", { email });
      // Simulate network delay for animation visibility (remove in production if not needed)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage(
        response.data.message ||
          "Yêu cầu kích hoạt đã được gửi thành công! Vui lòng kiểm tra email của bạn."
      );
      setEmail(""); // Clear the email field

      // After 3 seconds, show success message and redirect
      setTimeout(() => {
        setMessage("Vui lòng kiểm tra email của bạn để kích hoạt tài khoản!"); // Final message before redirect
        setTimeout(() => {
          navigate("/"); // Redirect to home page
        }, 1500); // Give a moment to read the final message
      }, 3000); // 3 seconds before the final message and redirect countdown begins
    } catch (err) {
      setIsSending(false); // Stop sending animation on error
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div
      className="max-w-md mx-auto my-12 p-8 rounded-xl shadow-lg 
                 bg-gradient-to-br from-pink-100 to-blue-100 
                 border border-gray-200 transform hover:scale-105 transition duration-300 ease-in-out"
    >
      <h2 className="text-3xl font-bold text-center mb-6 text-purple-600 font-sans-serif tracking-wide">
        Kích Hoạt Tài Khoản 🌸
      </h2>

      {message && (
        <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-center text-sm">
          {message}
        </p>
      )}

      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Email của bạn:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent 
                       bg-white border-purple-200 transform transition duration-200 ease-in-out
                       hover:border-purple-400"
            placeholder="nhap@emailcuaban.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSending}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition duration-300 ease-in-out 
                     ${
                       isSending
                         ? "bg-gray-400 cursor-not-allowed flex items-center justify-center"
                         : "bg-purple-500 hover:bg-purple-600 transform hover:scale-105 shadow-md hover:shadow-lg"
                     }`}
        >
          {isSending ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Đang gửi yêu cầu...
            </>
          ) : (
            "Gửi yêu cầu kích hoạt ✨"
          )}
        </button>
      </form>
    </div>
  );
};

export default ActiveAcc;
