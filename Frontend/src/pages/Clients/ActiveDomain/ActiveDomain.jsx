import React, { useState } from "react";
import api from "../../../utils/http";
import { Sparkles, KeyRound, Loader2 } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import AuthCardLayout from "@layouts/AuthCardLayout"; // Import layout chung

export default function ActiveDomain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const keyShop = e.target.keyShop.value;
      const res = await api.post("/domain/active", { keyShop });

      if (res.data?.status === true) {
        await showAlert("Kích hoạt thành công! Chuẩn bị cấu hình shop nào!");
        navigate("/activeWeb");
      } else {
        await showAlert(
          res.data?.message || "Mã kích hoạt không hợp lệ.",
          "error"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đã có lỗi không mong muốn xảy ra.";
      await showAlert(errorMessage, "error");
      console.error("Lỗi kích hoạt domain:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout title="Kích hoạt Shop" icon={KeyRound}>
      <p className="text-secondary text-sm text-center mb-6 -mt-4">
        Một mã kích hoạt "siêu cấp đáng yêu" đã được gửi đến email của bạn. Nhập
        nó vào ô dưới đây để hoàn tất nhé!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="keyShop" className="sr-only">
            Mã kích hoạt
          </label>
          <input
            id="keyShop"
            type="text"
            name="keyShop"
            placeholder="Nhập mã của bạn tại đây"
            className="w-full text-center text-lg rounded-lg px-4 py-3 bg-input text-input border-themed border-hover placeholder-theme"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="action-button action-button-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang kiểm tra...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" /> Kích hoạt liền tay!
            </>
          )}
        </button>
      </form>
    </AuthCardLayout>
  );
}
