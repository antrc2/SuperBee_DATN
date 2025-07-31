import { Eye, Lock, Key, Calendar, ChevronsRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Highlighter from "react-highlight-words"; // Thư viện để làm nổi bật chữ

// Helper để định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Component Badge cho Trạng thái, thông minh hơn
const StatusBadge = ({ status, endDate }) => {
  const isExpired = new Date(endDate) < new Date();
  let text = "Ngưng";
  let colorClasses =
    "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";

  if (status === 1 && !isExpired) {
    text = "Hoạt động";
    colorClasses =
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  } else if (status === 1 && isExpired) {
    text = "Hết hạn";
    colorClasses =
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses}`}
    >
      {text}
    </span>
  );
};

export default function DonatePromotionPage({
  loading,
  data,
  handleLock,
  handleUndo,
  searchTerm,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
          <tr>
            <th scope="col" className="px-6 py-3">
              ID
            </th>
            <th scope="col" className="px-6 py-3">
              Khuyến mãi (%)
            </th>
            <th scope="col" className="px-6 py-3">
              Thời gian hiệu lực
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4" colSpan="6">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-16 text-slate-500">
                <Tag size={48} className="mx-auto mb-2" />
                Không tìm thấy mã giảm giá nào.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                  <Highlighter
                    highlightClassName="bg-yellow-200 dark:bg-yellow-700 rounded-sm"
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={item.id.toString()}
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                  <Highlighter
                    highlightClassName="bg-yellow-200 dark:bg-yellow-700 rounded-sm"
                    searchWords={[searchTerm]}
                    autoEscape={true}
                    textToHighlight={`${item.amount}%`}
                  />
                </td>
                {/* <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                  {item.id}
                </td>
                <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                  {item.amount}%
                </td> */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar size={14} />
                    <span>{formatDate(item.start_date)}</span>
                    <ChevronsRight size={14} />
                    <span>{formatDate(item.end_date)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} endDate={item.end_date} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center gap-4">
                    <Link
                      to={`/admin/donatePromotions/${item.id}`}
                      title="Xem chi tiết"
                      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      <Eye size={18} />
                    </Link>
                    {item.status === 1 ? (
                      <button
                        onClick={() => handleLock(item.id)}
                        title="Tắt khuyến mãi"
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 transition-colors"
                      >
                        <Lock size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUndo(item.id)}
                        title="Kích hoạt lại"
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-green-600 transition-colors"
                      >
                        <Key size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
