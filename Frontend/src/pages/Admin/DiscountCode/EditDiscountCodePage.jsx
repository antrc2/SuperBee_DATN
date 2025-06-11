import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@utils/http";

const EditDiscountCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    usage_limit: "",
    per_user_limit: "",
    discount_value: "",
    min_discount_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    status: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountCode = async () => {
      try {
        const response = await api.get(`/admin/discountcode/${id}`);
        const data = response.data?.data || {};
        setForm({
          code: data.code || "",
          usage_limit: data.usage_limit || "",
          per_user_limit: data.per_user_limit || "",
          discount_value: data.discount_value || "",
          min_discount_amount: data.min_discount_amount || "",
          max_discount_amount: data.max_discount_amount || "",
          start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : "",
          end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : "",
          status: data.status !== undefined ? data.status : 1,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải dữ liệu mã giảm giá!");
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountCode();
  }, [id]);

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
        ...form,
        usage_limit: form.usage_limit !== "" ? Number(form.usage_limit) : -1,
  per_user_limit: form.per_user_limit !== "" ? Number(form.per_user_limit) : -1,
        discount_value: form.discount_value ? Number(form.discount_value) : null,
        min_discount_amount: form.min_discount_amount ? Number(form.min_discount_amount) : null,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
      };

      await api.put(`/admin/discountcode/${id}`, payload);
      alert("Cập nhật mã giảm giá thành công!");
      navigate("/admin/discountcode");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Chỉnh sửa mã giảm giá #{id}</h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượt sử dụng tối đa</label>
                <input
                  type="number"
                  name="usage_limit"
                  value={form.usage_limit}
                  onChange={handleChange}
                  min={-1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="-1 là không giới hạn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượt mỗi người dùng</label>
                <input
                  type="number"
                  name="per_user_limit"
                  value={form.per_user_limit}
                  onChange={handleChange}
                  min={-1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="-1 là không giới hạn"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  name="min_discount_amount"
                  value={form.min_discount_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá tối đa (VNĐ)</label>
                <input
                  type="number"
                  name="max_discount_amount"
                  value={form.max_discount_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value={1}>Kích hoạt</option>
                <option value={0}>Tạm ngừng</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDiscountCodePage;
