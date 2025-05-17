import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DonatePromotionForm = ({ initialData }) => {
  const navigate = useNavigate();
  const [webId, setWebId] = useState(1);
  const [amount, setAmount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  useEffect(() => {
    if (initialData) {
      setWebId(initialData.web_id || 1);
      setAmount(initialData.amount || 0);
      setStartDate(initialData.start_date || "");
      setEndDate(initialData.end_date || "");
      setCreatedBy(initialData.created_by || "");
      setUpdatedBy(initialData.updated_by || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      JSON.stringify(
        {
          web_id: webId,
          amount,
          start_date: startDate,
          end_date: endDate,
          created_by: createdBy,
          updated_by: updatedBy,
        },
        null,
        2
      )
    );
    navigate("/admin/donate-promotions");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        {initialData ? `Sửa khuyến mãi #${initialData.id}` : "Thêm khuyến mãi mới"}
      </h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Web ID</label>
        <input
          type="number"
          value={webId}
          onChange={(e) => setWebId(Number(e.target.value))}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Phần trăm khuyến mãi</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Ngày kết thúc</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {initialData && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Ngày tạo</label>
            <input
              type="text"
              value={initialData.created_at}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ngày sửa</label>
            <input
              type="text"
              value={initialData.updated_at}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Người tạo</label>
          <input
            type="text"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Người sửa</label>
          <input
            type="text"
            value={updatedBy}
            onChange={(e) => setUpdatedBy(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => navigate("/admin/donate-promotions")}
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

export default DonatePromotionForm;
