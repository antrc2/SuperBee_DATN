import { Link } from "react-router-dom";
import { useState } from "react";

const DonatePromotionPage = () => {
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      web_id: 1,
      amount: 20,
      start_date: "2024-05-01",
      end_date: "2024-12-31",
      created_at: "2024-04-30",
      updated_at: "2024-05-01",
    },
    {
      id: 2,
      web_id: 2,
      amount: 15,
      start_date: "2024-06-01",
      end_date: "2024-09-30",
      created_at: "2024-05-15",
      updated_at: "2024-05-16",
    },
  ]);

  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(promotions.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá khuyến mãi này không?")) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (
      selectedIds.length > 0 &&
      window.confirm("Bạn có chắc chắn muốn xoá các khuyến mãi đã chọn?")
    ) {
      setPromotions((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý khuyến mãi nạp thẻ</h1>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Xoá đã chọn ({selectedIds.length})
            </button>
          )}
          <Link to="/admin/donate-promotions/new">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              + Thêm khuyến mãi
            </button>
          </Link>
        </div>
      </div>

      <table className="min-w-full bg-white shadow rounded text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedIds.length === promotions.length &&
                  promotions.length > 0
                }
              />
            </th>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Web ID</th>
            <th className="px-3 py-2">Phần trăm KM</th>
            <th className="px-3 py-2">Bắt đầu</th>
            <th className="px-3 py-2">Kết thúc</th>
            <th className="px-3 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => handleSelect(p.id)}
                />
              </td>
              <td className="px-3 py-2">{p.id}</td>
              <td className="px-3 py-2">{p.web_id}</td>
              <td className="px-3 py-2">{p.amount}%</td>
              <td className="px-3 py-2">{p.start_date}</td>
              <td className="px-3 py-2">{p.end_date}</td>
              <td className="px-3 py-2 text-center space-x-2">
                <Link to={`/admin/donate-promotions/${p.id}/edit`}>
                  <button className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white">
                    Sửa
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
          {promotions.length === 0 && (
            <tr>
              <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
                Không có khuyến mãi nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DonatePromotionPage;
