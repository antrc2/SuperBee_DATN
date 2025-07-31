import React, { useState, useEffect } from "react";
import api from "../../../utils/http";
import LoadingCon from "@components/Loading/LoadingCon";
import { useNotification } from "../../../contexts/NotificationContext";

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const WithdrawForm = ({ initialData, onSuccess }) => {
  const isEditMode = Boolean(initialData);
  const { pop } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [banks, setBanks] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    amount: "",
    bank_name: "",
    bank_account_number: "",
    account_holder_name: "",
    note: "",
  });

  useEffect(() => {
    const fetchFormData = async () => {
      setIsLoading(true);
      try {
        const [balanceRes, banksRes] = await Promise.all([
          api.get("/withdraws/balance"),
          api.get("/withdraws/allow_banks"),
        ]);
        setBalance(balanceRes.data.data);
        setBanks(banksRes.data.data);
      } catch (error) {
        pop("Không thể tải dữ liệu cần thiết cho form.", "e");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFormData();
  }, [pop]);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        amount: initialData.amount || "",
        bank_name: initialData.bank_name || "",
        bank_account_number: initialData.bank_account_number || "",
        account_holder_name: initialData.account_holder_name || "",
        note: initialData.note || "",
      });
    }
  }, [initialData, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "account_holder_name") {
      processedValue = removeAccents(value).toUpperCase();
    } else if (name === "note") {
      processedValue = removeAccents(value);
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) < 10000)
      newErrors.amount = "Số tiền phải lớn hơn 10,000 VND.";
    if (!formData.bank_name) newErrors.bank_name = "Vui lòng chọn ngân hàng.";
    if (!formData.bank_account_number)
      newErrors.bank_account_number = "Vui lòng nhập số tài khoản.";
    if (!formData.account_holder_name)
      newErrors.account_holder_name = "Vui lòng nhập tên chủ tài khoản.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await api.put(`/withdraws/${initialData.id}`, formData);
        pop("Cập nhật yêu cầu thành công!", "s");
      } else {
        await api.post("/withdraws", formData);
        pop("Tạo yêu cầu rút tiền thành công!", "s");
      }
      onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Thao tác thất bại.";
      pop(errorMessage, "e");
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (hasError) =>
    `mt-1 block w-full px-3 py-2 rounded-md shadow-sm bg-input text-input border-hover placeholder-theme focus:outline-none focus:border-hover ${
      hasError ? "border-red-500" : "border-themed"
    }`;

  if (isLoading) {
    return (
      <div className="section-bg h-96 flex justify-center items-center">
        <LoadingCon />
      </div>
    );
  }

  return (
    <div className="section-bg shadow-themed">
      <div className="mb-4 border-b border-themed pb-4">
        <h3 className="text-secondary text-sm">Số dư khả dụng</h3>
        <p className="font-heading text-2xl font-bold text-highlight">
          {balance !== null
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(balance)
            : "..."}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ================================================================== */}
        {/* ======================= THAY ĐỔI CHÍNH Ở ĐÂY ======================= */}
        {/* ================================================================== */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-primary"
          >
            Số tiền muốn rút
          </label>
          {isEditMode ? (
            // KHI SỬA: Hiển thị ô bị vô hiệu hóa với số tiền đã định dạng
            <>
              <input
                type="text"
                disabled
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(formData.amount || 0)}
                className={
                  inputClasses(errors.amount) + " cursor-not-allowed opacity-70"
                }
              />
              <p className="mt-1 text-xs text-secondary">
                Không thể thay đổi số tiền của yêu cầu đã tạo.
              </p>
            </>
          ) : (
            // KHI TẠO MỚI: Hiển thị ô nhập số bình thường
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className={inputClasses(errors.amount)}
              placeholder="Ví dụ: 50000"
            />
          )}
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>
        {/* ================================================================== */}
        {/* ========================= KẾT THÚC THAY ĐỔI ========================= */}
        {/* ================================================================== */}

        <div>
          <label
            htmlFor="bank_name"
            className="block text-sm font-medium text-primary"
          >
            Ngân hàng thụ hưởng
          </label>
          <select
            name="bank_name"
            value={formData.bank_name}
            onChange={handleInputChange}
            className={inputClasses(errors.bank_name)}
          >
            <option value="">-- Chọn một ngân hàng --</option>
            {banks.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          {errors.bank_name && (
            <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bank_account_number"
            className="block text-sm font-medium text-primary"
          >
            Số tài khoản
          </label>
          <input
            type="text"
            name="bank_account_number"
            value={formData.bank_account_number}
            onChange={handleInputChange}
            className={inputClasses(errors.bank_account_number)}
            placeholder="Nhập số tài khoản ngân hàng"
          />
          {errors.bank_account_number && (
            <p className="mt-1 text-sm text-red-600">
              {errors.bank_account_number}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="account_holder_name"
            className="block text-sm font-medium text-primary"
          >
            Tên chủ tài khoản (IN HOA, không dấu)
          </label>
          <input
            type="text"
            name="account_holder_name"
            value={formData.account_holder_name}
            onChange={handleInputChange}
            className={inputClasses(errors.account_holder_name)}
            placeholder="NGUYEN VAN A"
          />
          {errors.account_holder_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.account_holder_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-primary"
          >
            Ghi chú (Tùy chọn)
          </label>
          <textarea
            name="note"
            rows="3"
            value={formData.note}
            onChange={handleInputChange}
            className={inputClasses(errors.note)}
            placeholder="Nội dung không dấu"
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="action-button action-button-primary w-full disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoadingCon />
            ) : isEditMode ? (
              "Lưu Thay Đổi"
            ) : (
              "Gửi Yêu Cầu"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WithdrawForm;
