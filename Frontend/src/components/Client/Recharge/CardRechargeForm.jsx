// src/components/Client/Recharge/CardRechargeForm.jsx

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CreditCard, Clock, AlertCircle, Download, Copy } from "lucide-react";
import { cardTypes, cardDenominations } from "../../../config/recharge";
import api from "@utils/http";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "@contexts/NotificationContext";

export function CardRechargeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Sử dụng reset để điền lại dữ liệu cho form
  } = useForm({
    defaultValues: { serial: "", pin: "" },
  });

  const [selectedType, setSelectedType] = useState(cardTypes[0].id);
  const [selectedDenomination, setSelectedDenomination] = useState(
    cardDenominations[4].value
  );
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const { pop } = useNotification();
  const { fetchUserMoney, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // --- LOGIC MỚI BẠN YÊU CẦU ---
  useEffect(() => {
    // Hàm này sẽ chạy mỗi khi trạng thái đăng nhập thay đổi
    if (isLoggedIn) {
      // 1. Lấy dữ liệu đã lưu từ sessionStorage
      const savedDataJSON = sessionStorage.getItem("nap_cart");

      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);

          // 2. Gán lại giá trị cho các state và các trường input
          setSelectedType(savedData.telco);
          setSelectedDenomination(savedData.amount);
          reset({
            serial: savedData.serial,
            pin: savedData.code,
          });

          pop("Thông tin nạp thẻ của bạn đã được khôi phục.", "success");

          // 3. Xóa dữ liệu khỏi sessionStorage sau khi đã sử dụng
          sessionStorage.removeItem("nap_cart");
        } catch (error) {
          console.error("Lỗi khi đọc dữ liệu nạp thẻ đã lưu:", error);
          sessionStorage.removeItem("nap_cart"); // Dọn dẹp nếu có lỗi
        }
      }
    }
  }, [isLoggedIn, reset, pop]); // Thêm `reset` và `pop` vào dependency array

  const onSubmit = async (data) => {
    // Kiểm tra đăng nhập trước khi gửi
    if (!isLoggedIn) {
      const rechargeData = {
        telco: selectedType,
        amount: selectedDenomination,
        serial: data.serial,
        code: data.pin,
      };
      localStorage.setItem("location", "/recharge-atm");
      sessionStorage.setItem("nap_cart", JSON.stringify(rechargeData));
      pop("Vui lòng đăng nhập để hoàn tất nạp thẻ.", "info");
      navigate("/auth/login");
      return; // Dừng hàm tại đây
    }

    setSubmissionStatus({
      type: "loading",
      message: "Đang kiểm tra thẻ, vui lòng chờ...",
    });

    // Tạo payload dữ liệu
    const rechargePayload = {
      telco: selectedType,
      amount: selectedDenomination,
      serial: data.serial,
      code: data.pin,
    };

    try {
      const response = await api.post("/donate/card", rechargePayload);
      if (response.data.success) {
        setSubmissionStatus({
          type: "success",
          message:
            response.data.message || "Gửi thẻ thành công! Vui lòng chờ duyệt.",
        });
        reset();
        fetchUserMoney();
      } else {
        setSubmissionStatus({
          type: "error",
          message:
            response.data.message || "Nạp thẻ thất bại. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đã có lỗi xảy ra từ máy chủ.";
      setSubmissionStatus({ type: "error", message: errorMessage });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 animate-fade-in"
    >
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          1. Chọn loại thẻ
        </label>
        <div className="grid grid-cols-3 gap-2">
          {cardTypes.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedType(card.id)}
              className={`selection-grid-item ${
                selectedType === card.id ? "selection-grid-item-selected" : ""
              }`}
            >
              <img
                src={card.logo}
                alt={card.name}
                className="h-8 mx-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          2. Chọn mệnh giá
        </label>
        <div className="grid grid-cols-4 gap-2">
          {cardDenominations.map((denom) => (
            <div
              key={denom.value}
              onClick={() => setSelectedDenomination(denom.value)}
              className={`selection-grid-item text-xs font-semibold ${
                selectedDenomination === denom.value
                  ? "selection-grid-item-selected"
                  : ""
              }`}
            >
              {denom.label}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          3. Nhập thông tin thẻ
        </label>
        <div className="mt-2 space-y-2">
          <input
            type="text"
            placeholder="Số Seri"
            className={`block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input ${
              errors.serial ? "border-red-500" : ""
            }`}
            {...register("serial", {
              required: "Số seri là bắt buộc.",
              pattern: {
                value: /^[a-zA-Z0-9]{8,20}$/,
                message: "Serial không hợp lệ.",
              },
            })}
          />
          {errors.serial && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.serial.message}
            </p>
          )}
          <input
            type="text"
            placeholder="Mã PIN"
            className={`block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input ${
              errors.pin ? "border-red-500" : ""
            }`}
            {...register("pin", {
              required: "Mã PIN là bắt buộc.",
              pattern: {
                value: /^[a-zA-Z0-9]{8,20}$/,
                message: "Mã PIN không hợp lệ.",
              },
            })}
          />
          {errors.pin && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.pin.message}
            </p>
          )}
        </div>
      </div>
      {submissionStatus && (
        <div
          className={`alert ${
            submissionStatus.type === "success"
              ? "alert-success"
              : submissionStatus.type === "error"
              ? "alert-danger"
              : "alert-info"
          }`}
        >
          {submissionStatus.message}
        </div>
      )}
      <div className="alert alert-warning">
        <strong>Lưu ý:</strong> Vui lòng chọn đúng mệnh giá. Sai mệnh giá sẽ
        không được cộng tiền.
      </div>
      <button
        type="submit"
        disabled={submissionStatus?.type === "loading"}
        className="w-full py-3 font-heading flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all text-accent-contrast bg-gradient-button hover:brightness-110 disabled:opacity-60"
      >
        {submissionStatus?.type === "loading" ? (
          <Clock size={16} className="animate-spin" />
        ) : (
          <CreditCard size={16} />
        )}
        {submissionStatus?.type === "loading"
          ? "Đang Xử Lý..."
          : "Nạp Thẻ Ngay"}
      </button>
    </form>
  );
}
export const BankRechargeTab = ({ user }) => {
  console.log("🚀 ~ BankRechargeTab ~ user:", user);
  const bankInfo = useRef(null);

  const [showCopied, setShowCopied] = useState("");
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(field);
      setTimeout(() => setShowCopied(""), 2000);
    });
  };

  if (!user) {
    return <LoadingDomain />;
  } else {
    bankInfo.current = {
      bankName: "Ngân hàng Quân đội (MB Bank)",
      accountNumber: "0838411897",
      accountHolder: "NGUYEN NGOC AN",
      transferContentPrefix: `${user.donate_code}`,
      qrCodeUrl: `https://img.vietqr.io/image/MB-0838411897-qr_only.png?addInfo=${user.donate_code}`,
    };
  }

  return (
    <div className="bg-content p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex flex-col  items-center gap-8">
        <div className="flex-shrink-0 text-center">
          <img
            src={bankInfo.current.qrCodeUrl}
            alt="Bank QR Code"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain border rounded-lg p-2 bg-white shadow-sm"
          />
          <a
            href={bankInfo.current.qrCodeUrl}
            download="Ma_QR_SuperBee.png"
            className="mt-3 inline-flex items-center text-secondary hover:text-primary text-sm font-medium"
          >
            <Download size={16} className="mr-1" /> Tải mã QR
          </a>
        </div>
        <div className="w-full text-sm space-y-3">
          <p className="text-secondary">
            Ngân hàng:{" "}
            <strong className="text-primary">
              {bankInfo.current.bankName}
            </strong>
          </p>
          <p className="text-secondary">
            Chủ tài khoản:{" "}
            <strong className="text-primary">
              {bankInfo.current.accountHolder}
            </strong>
          </p>
          <div className="flex items-center justify-between">
            <p className="text-secondary">
              Số tài khoản:{" "}
              <strong className="text-primary">
                {bankInfo.current.accountNumber}
              </strong>
            </p>
            <button
              onClick={() =>
                copyToClipboard(bankInfo.current.accountNumber, "account")
              }
              className="text-secondary hover:text-primary"
            >
              <Copy size={16} />
            </button>
            {showCopied === "account" && (
              <span className="text-xs text-tertiary">Đã chép!</span>
            )}
          </div>
          <div className="p-3 rounded-lg bg-input border-themed border">
            <p className="text-secondary">Nội dung chuyển khoản:</p>
            <div className="flex items-center justify-between mt-1">
              <strong className="text-lg text-highlight">
                {bankInfo.current.transferContentPrefix}
              </strong>
              <button
                onClick={() =>
                  copyToClipboard(
                    bankInfo.current.transferContentPrefix,
                    "content"
                  )
                }
                className="text-secondary hover:text-primary"
              >
                <Copy size={16} />
              </button>
              {showCopied === "content" && (
                <span className="text-xs text-tertiary">Đã chép!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
