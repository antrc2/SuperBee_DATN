import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

export default function CreateFormDonatePromotion({
  initialData = null,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || "",
    start_date: initialData?.start_date ? new Date(initialData.start_date) : null,
    end_date: initialData?.end_date ? new Date(initialData.end_date) : null,
    usage_limit: initialData?.usage_limit ?? -1,
    per_user_limit: initialData?.per_user_limit ?? -1,
    status: initialData?.status ?? 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount) return alert("Vui lòng nhập số % khuyến mãi.");
    if (!formData.start_date || !formData.end_date)
      return alert("Vui lòng chọn thời gian hiệu lực.");

    const data = {
      ...formData,
      total_used:0,
      start_date: dayjs(formData.start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: dayjs(formData.end_date).format("YYYY-MM-DD HH:mm:ss"),
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="p-6 border bg-white rounded shadow-sm">
        <h3 className="mb-4 font-medium text-gray-900">
          {isEditing ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi Donate"}
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block mb-1 text-sm">
              Giá trị khuyến mãi (VNĐ)
            </label>
            <input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full p-2 rounded border"
            />
          </div>

          <div>
            <label htmlFor="status" className="block mb-1 text-sm">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Tạm tắt</option>
            </select>
          </div>

          <div>
            <label htmlFor="usage_limit" className="block mb-1 text-sm">
              Giới hạn sử dụng tổng
            </label>
            <input
              name="usage_limit"
              type="number"
              value={formData.usage_limit}
              onChange={handleChange}
              className="w-full p-2 rounded border"
              placeholder="-1 nghĩa là không giới hạn"
            />
          </div>

          <div>
            <label htmlFor="per_user_limit" className="block mb-1 text-sm">
              Giới hạn mỗi người dùng
            </label>
            <input
              name="per_user_limit"
              type="number"
              value={formData.per_user_limit}
              onChange={handleChange}
              className="w-full p-2 rounded border"
              placeholder="-1 nghĩa là không giới hạn"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Thời gian bắt đầu</label>
            <div className="relative">
              <DatePicker
                selected={formData.start_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, start_date: date }))
                }
                className="w-full p-2 rounded border"
                placeholderText="Chọn ngày bắt đầu"
                showTimeSelect
                dateFormat="Pp"
              />
              <CalendarIcon className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">Thời gian kết thúc</label>
            <div className="relative">
              <DatePicker
                selected={formData.end_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, end_date: date }))
                }
                className="w-full p-2 rounded border"
                placeholderText="Chọn ngày kết thúc"
                showTimeSelect
                dateFormat="Pp"
              />
              <CalendarIcon className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? "Đang lưu..." : isEditing ? "Cập Nhật" : "Tạo Khuyến Mãi"}
        </button>
      </div>
    </form>
  );
}
