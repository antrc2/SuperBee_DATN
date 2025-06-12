import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DiscountCodeForm = ({ initialData }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [usageLimit, setUsageLimit] = useState(-1);
  const [usedCount, setUsedCount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [minDiscountAmount, setMinDiscountAmount] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(0);
  const [userId, setUserId] = useState(0);
  const [webId, setWebId] = useState(1);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || "");
      setUsageLimit(initialData.usage_limit ?? -1);
      setUsedCount(initialData.used_count ?? 0);
      setStartDate(initialData.start_date || "");
      setEndDate(initialData.end_date || "");
      setDiscountAmount(initialData.discount_amount || 0);
      setMinDiscountAmount(initialData.min_discount_amount || 0);
      setMaxDiscountAmount(initialData.max_discount_amount || 0);
      setUserId(initialData.user_id ?? 0);
      setWebId(initialData.web_id || 1);
      setCreatedBy(initialData.created_by || "");
      setUpdatedBy(initialData.updated_by || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      JSON.stringify(
        {
          code,
          usage_limit: usageLimit,
          used_count: usedCount,
          start_date: startDate,
          end_date: endDate,
          discount_amount: discountAmount,
          min_discount_amount: minDiscountAmount,
          max_discount_amount: maxDiscountAmount,
          user_id: userId,
          web_id: webId,
          created_by: createdBy,
          updated_by: updatedBy,
        },
        null,
        2
      )
    );
    navigate("/admin/discount-codes");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        {initialData ? `Sửa mã giảm giá #${initialData.id}` : "Thêm mã giảm giá mới"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Mã giảm giá</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Giới hạn sử dụng</label>
          <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Đã sử dụng</label>
          <input type="number" value={usedCount} onChange={(e) => setUsedCount(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phần trăm giảm</label>
          <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Cận dưới</label>
          <input type="number" value={minDiscountAmount} onChange={(e) => setMinDiscountAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Cận trên</label>
          <input type="number" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Ngày bắt đầu</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Ngày kết thúc</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">User ID</label>
          <input type="number" value={userId} onChange={(e) => setUserId(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Web ID</label>
          <input type="number" value={webId} onChange={(e) => setWebId(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      {initialData && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block mb-1 font-medium">Ngày tạo</label>
            <input type="text" value={initialData.created_at} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ngày sửa</label>
            <input type="text" value={initialData.updated_at} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block mb-1 font-medium">Người tạo</label>
          <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Người sửa</label>
          <input type="text" value={updatedBy} onChange={(e) => setUpdatedBy(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-2">
        <button
          type="button"
          onClick={() => navigate("/admin/discount-codes")}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Hủy
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Lưu
        </button>
      </div>
    </form>
  );
};

export default DiscountCodeForm;