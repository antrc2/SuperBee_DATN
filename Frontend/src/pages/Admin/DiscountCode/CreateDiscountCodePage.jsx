import { useState } from "react";
import api from "@utils/http";
import { useNavigate } from "react-router-dom";

const initialState = {
  code: "",
  usage_limit: "",
  per_user_limit: "",
  discount_value: "",
  min_discount_amount: "",
  max_discount_amount: "",
  start_date: "",
  end_date: "",
  status: 1,
};

const CreateDiscountCodePage = () => {
  const [form, setForm] = useState(initialState);
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

    // Validate cơ bản
    if (form.discount_value > 100 || form.discount_value < 1) {
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
        code: form.code,
        discount_value: form.discount_value ? Number(form.discount_value) : 0,
        usage_limit: form.usage_limit !== "" ? Number(form.usage_limit) : -1,
        per_user_limit: form.per_user_limit !== "" ? Number(form.per_user_limit) : -1,
        min_discount_amount:
          form.min_discount_amount !== "" ? Number(form.min_discount_amount) : null,
        max_discount_amount:
          form.max_discount_amount !== "" ? Number(form.max_discount_amount) : null,
        start_date: form.start_date,
        end_date: form.end_date,
        status: Number(form.status),
      };


      await api.post("/admin/discountcode", payload);
      alert("Tạo mã giảm giá thành công!");
      navigate("/admin/discountcode");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tạo Mã Giảm Giá Mới</h2>

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
                className="w-full px-4 py-2 border rounded-md"
                placeholder="SALE2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                min={1}
                max={100}
                required
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lượt dùng tối đa</label>
              <input
                type="number"
                name="usage_limit"
                value={form.usage_limit}
                onChange={handleChange}
                min={-1}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="-1 là không giới hạn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mỗi người dùng</label>
              <input
                type="number"
                name="per_user_limit"
                value={form.per_user_limit}
                onChange={handleChange}
                min={-1}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="-1 là không giới hạn"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối thiểu (VNĐ)</label>
              <input
                type="number"
                name="min_discount_amount"
                value={form.min_discount_amount}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                name="max_discount_amount"
                value={form.max_discount_amount}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border rounded-md"
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
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value={1}>Kích hoạt</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang tạo..." : "Tạo mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscountCodePage;
