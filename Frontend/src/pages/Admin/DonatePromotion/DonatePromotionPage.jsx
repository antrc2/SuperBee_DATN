import { Eye, FilePenLine, Lock, Key } from "lucide-react";
import { Link } from "react-router-dom";

export default function DonatePromotionListPage({ data, handleLock, handleUndo }) {
  console.log("Dữ liệu khuyến mãi nhận được:", data.data);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Số lượng</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Thời gian</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700">{item.id}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{item.amount.toLocaleString()}%</td>
              <td className="py-3 px-4 text-sm text-gray-700">
                {item.start_date} → {item.end_date}
              </td>
              <td className="py-3 px-4 text-sm">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {item.status === 1 ? "Hoạt động" : "Ngưng"}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center gap-4">
                  <Link to={`/admin/donatePromotions/${item.id}`} title="Xem chi tiết">
                    <Eye className="text-green-500 hover:text-green-700 cursor-pointer" size={20} />
                  </Link>
                  {item.status === 1 ? (
                    <button onClick={() => handleLock(item.id)} title="Tắt khuyến mãi">
                      <Lock className="text-red-500 hover:text-red-700 cursor-pointer" size={20} />
                    </button>
                  ) : (
                    <button onClick={() => handleUndo(item.id)} title="Kích hoạt lại">
                      <Key className="text-yellow-500 hover:text-yellow-700 cursor-pointer" size={20} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
