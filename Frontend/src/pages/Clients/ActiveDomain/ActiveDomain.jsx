import React, { useState } from "react";
import api from "../../../utils/http";
import { Sparkles } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationProvider";
import { useNavigate } from "react-router-dom";

export default function ActiveDomain() {
  const navigator = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useNotification();
  const postData = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/domain/active", { ...data });
      console.log(res?.data?.status);
      if (res.data?.status === true) {
        await showAlert("Kích hoạt thành công! Trang sẽ tải lại.");
        navigator("/activeWeb");
      } else {
        alert(res.data?.message || "Có lỗi xảy ra khi kích hoạt.");
      }
    } catch (error) {
      console.error("Lỗi kích hoạt domain:", error);
      if (error?.response?.data?.status === false) {
        await showAlert(
          error?.response?.data?.message || "Không xác định được lỗi."
        );
      } else {
        await showAlert("Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const keyShop = e.target.keyShop.value;
    await postData({ keyShop: keyShop });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4 font-sans relative overflow-hidden">
      <div className="absolute top-10 left-1/4 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-5 right-1/4 w-40 h-40 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="relative text-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-sm w-full border-4 border-dashed border-teal-300 transform rotate-2 hover:rotate-0 transition-transform duration-500">
        <Sparkles className="w-20 h-20 mx-auto mb-5 text-yellow-400 animate-sparkle drop-shadow-lg" />
        <h1 className="text-3xl font-extrabold text-teal-600 mb-4 font-display">
          Chờ xíu nha! <br /> Kiểm tra Email của bạn!
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed font-sans">
          Một mã kích hoạt "siêu cấp đáng yêu" đã được gửi đến email của bạn.
          Nhập nó vào ô dưới đây để hoàn tất nè!
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="keyShop"
            placeholder={
              loading ? "Đang xử lý..." : "Nhập mã kích hoạt của bạn"
            }
            className="p-3 border-2 border-dashed border-purple-300 rounded-xl text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 text-purple-800 placeholder-purple-400 transition-all duration-300 transform focus:scale-105"
            required
            disabled={loading} // Disable input when loading
          />
          <button
            type="submit"
            className={`
              inline-flex items-center justify-center
              bg-pink-500 text-white px-6 py-3 rounded-full text-xl font-bold
              transition-all duration-300 shadow-md border-b-4
              ${
                loading
                  ? "bg-gray-400 border-gray-600 cursor-not-allowed"
                  : "bg-pink-500 border-pink-700 hover:bg-pink-600 hover:border-pink-800 transform hover:scale-105 active:scale-95"
              }
            `}
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">✨</span> Đang gửi...
              </>
            ) : (
              "Kích hoạt liền tay!"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
