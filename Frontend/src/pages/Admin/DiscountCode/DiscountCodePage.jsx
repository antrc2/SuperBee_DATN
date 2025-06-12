import { Link } from "react-router-dom";
import { useState } from "react";

const DiscountCodePage = () => {
  const [discountCodes, setDiscountCodes] = useState([
    {
      id: 1,
      code: "GIAM10",
      usage_limit: 100,
      used_count: 20,
      discount_amount: 10,
      min_discount_amount: 5000,
      max_discount_amount: 20000,
      start_date: "2024-05-01",
      end_date: "2024-12-31",
      user_id: 0,
      web_id: 1,
      created_at: "2024-04-30",
      updated_at: "2024-05-01",
      created_by: "admin",
      updated_by: "admin",
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá mã giảm giá này không?")) {
      setDiscountCodes((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
        <Link to="/admin/discount-codes/new">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            + Thêm mã giảm giá
          </button>
        </Link>
      </div>

      <table className="min-w-full bg-white shadow rounded text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Code</th>
            <th className="px-3 py-2">Giới hạn</th>
            <th className="px-3 py-2">Đã dùng</th>
            <th className="px-3 py-2">%</th>
            <th className="px-3 py-2">Bắt đầu</th>
            <th className="px-3 py-2">Kết thúc</th>
            <th className="px-3 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {discountCodes.map((d) => (
            <tr key={d.id} className="border-b">
              <td className="px-3 py-2">{d.id}</td>
              <td className="px-3 py-2">{d.code}</td>
              <td className="px-3 py-2">{d.usage_limit === -1 ? "Không giới hạn" : d.usage_limit}</td>
              <td className="px-3 py-2">{d.used_count}</td>
              <td className="px-3 py-2">{d.discount_amount}%</td>
              <td className="px-3 py-2">{d.start_date}</td>
              <td className="px-3 py-2">{d.end_date}</td>
              <td className="px-3 py-2 text-center space-x-2">
                <Link to={`/admin/discount-codes/${d.id}/edit`}>
                  <button className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white">
                    Sửa
                  </button>
                </Link>
                <button
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                  onClick={() => handleDelete(d.id)}
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountCodePage;
