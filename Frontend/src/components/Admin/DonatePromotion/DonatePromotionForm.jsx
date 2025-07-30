// @components/Admin/DonatePromotion/DonatePromotionForm.jsx (Validate lỗi trực tiếp)

import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

import "react-datepicker/dist/react-datepicker.css";

// --- CÁC COMPONENT GIAO DIỆN NHỎ ---
// Thêm prop `hasError` để thay đổi border khi có lỗi
const Label = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
  >
    {children}
  </label>
);

const Input = ({ hasError, ...props }) => (
  <input
    {...props}
    className={`mt-2 block w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50
      ${
        hasError
          ? "border-red-500 text-red-600"
          : "border-slate-300 dark:border-slate-700"
      }`}
  />
);

const Select = ({ hasError, ...props }) => (
  <select
    {...props}
    className={`mt-2 block w-full rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50
      ${
        hasError
          ? "border-red-500 text-red-600"
          : "border-slate-300 dark:border-slate-700"
      }`}
  >
    {props.children}
  </select>
);

// --- COMPONENT FORM CHÍNH ---

export default function DonatePromotionForm({
  initialData = null,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  // --- STATE ---
  const [formData, setFormData] = useState({
    amount: initialData?.amount || "",
    start_date: initialData?.start_date
      ? new Date(initialData.start_date)
      : null,
    end_date: initialData?.end_date ? new Date(initialData.end_date) : null,
    usage_limit: initialData?.usage_limit ?? -1,
    per_user_limit: initialData?.per_user_limit ?? -1,
    status: initialData?.status ?? 1,
  });

  // **[MỚI]** State để lưu các lỗi validation
  const [errors, setErrors] = useState({});

  // --- LOGIC ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
    // Xóa lỗi khi người dùng chọn ngày
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // **[CẬP NHẬT]** Hàm validate và submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Giá trị khuyến mãi phải là số lớn hơn 0.";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Vui lòng chọn ngày bắt đầu.";
    }
    if (!formData.end_date) {
      newErrors.end_date = "Vui lòng chọn ngày kết thúc.";
    }
    if (
      formData.start_date &&
      formData.end_date &&
      dayjs(formData.end_date).isBefore(dayjs(formData.start_date))
    ) {
      newErrors.end_date = "Ngày kết thúc không được trước ngày bắt đầu.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Dừng lại nếu có lỗi
    }

    // Nếu không có lỗi, tiến hành submit
    const dataToSubmit = {
      ...formData,
      start_date: dayjs(formData.start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: dayjs(formData.end_date).format("YYYY-MM-DD HH:mm:ss"),
    };
    onSubmit(dataToSubmit);
  };

  const CustomDatePickerInput = React.forwardRef(
    ({ value, onClick, hasError }, ref) => (
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={`mt-2 flex w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-left text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
        ${
          hasError ? "border-red-500" : "border-slate-300 dark:border-slate-700"
        }`}
      >
        <span
          className={
            !value
              ? "text-slate-400"
              : hasError
              ? "text-red-600"
              : "text-slate-800 dark:text-slate-200"
          }
        >
          {value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "Chọn ngày..."}
        </span>
        <CalendarIcon
          className={`h-4 w-4 ${hasError ? "text-red-500" : "text-slate-500"}`}
        />
      </button>
    )
  );

  // -- GIAO DIỆN --
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
          <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
            Thông tin cơ bản
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Thiết lập giá trị khuyến mãi và trạng thái hoạt động.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="amount">Giá trị khuyến mãi (%)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Ví dụ: 10"
                hasError={!!errors.amount} // **[MỚI]**
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Tạm tắt</option>
              </Select>
            </div>
          </div>
        </div>
        <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
          <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
            Giới hạn sử dụng
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Đặt giới hạn số lần mã có thể được sử dụng. Nhập -1 để không giới
            hạn.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="usage_limit">Giới hạn sử dụng tổng</Label>
              <Input
                id="usage_limit"
                name="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={handleChange}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="per_user_limit">Giới hạn trên mỗi người</Label>
              <Input
                id="per_user_limit"
                name="per_user_limit"
                type="number"
                value={formData.per_user_limit}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="pb-8">
          <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
            Thời gian hiệu lực
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Khuyến mãi sẽ chỉ có hiệu lực trong khoảng thời gian này.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label>Thời gian bắt đầu</Label>
              <DatePicker
                selected={formData.start_date}
                onChange={(date) => handleDateChange("start_date", date)}
                showTimeSelect
                dateFormat="Pp"
                customInput={
                  <CustomDatePickerInput hasError={!!errors.start_date} />
                } // **[MỚI]**
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>
            <div className="sm:col-span-3">
              <Label>Thời gian kết thúc</Label>
              <DatePicker
                selected={formData.end_date}
                onChange={(date) => handleDateChange("end_date", date)}
                showTimeSelect
                dateFormat="Pp"
                customInput={
                  <CustomDatePickerInput hasError={!!errors.end_date} />
                } // **[MỚI]**
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {isLoading
            ? "Đang lưu..."
            : isEditing
            ? "Cập nhật khuyến mãi"
            : "Tạo khuyến mãi"}
        </button>
      </div>
    </form>
  );
}
