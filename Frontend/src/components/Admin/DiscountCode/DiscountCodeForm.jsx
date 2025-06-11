import { useState } from "react";
import api from "@utils/http";
import { useNavigate } from "react-router-dom";

const DiscountCodeForm = ({ isEdit = false, id, initialData }) => {
  const [form, setForm] = useState(
    initialData || {
      code: "",
      usage_limit: "",
      discount_amount: "",
      min_discount_amount: "",
      max_discount_amount: "",
      start_date: "",
      end_date: "",
      status: 1,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (form.discount_amount > 100 || form.discount_amount < 1) {
      setError("Phần trăm giảm phải từ 1 đến 100%");
      setLoading(false);
      return;
    }

    if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        discount_amount: form.discount_amount ? Number(form.discount_amount) : null,
        min_discount_amount: form.min_discount_amount ? Number(form.min_discount_amount) : null,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
      };

      if (isEdit) {
        await api.patch(`/discountcode/${id}`, payload);
        alert("Cập nhật mã giảm giá thành công!");
      } else {
        await api.post("/discountcode", payload);
        alert("Tạo mã giảm giá thành công!");
      }
      navigate("/admin/discount-codes");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 py-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập mã giảm giá (VD: SALE2025)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lượt sử dụng</label>
              <input
                type="number"
                name="usage_limit"
                value={form.usage_limit}
                onChange={handleChange}
                min={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Số lần sử dụng tối đa"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="discount_amount"
                value={form.discount_amount}
                onChange={handleChange}
                min={1}
                max={100}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1 - 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>Kích hoạt</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm tối thiểu</label>
              <input
                type="number"
                name="min_discount_amount"
                value={form.min_discount_amount}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Giá trị tối thiểu (VNĐ)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm tối đa</label>
              <input
                type="number"
                name="max_discount_amount"
                value={form.max_discount_amount}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Giá trị tối đa (VNĐ)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                Đang lưu...
              </div>
            ) : isEdit ? (
              "Cập nhật"
            ) : (
              "Tạo mới"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiscountCodeForm;