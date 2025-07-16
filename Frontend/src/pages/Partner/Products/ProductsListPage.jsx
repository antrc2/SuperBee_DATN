// @pages/Admin/Products/ProductsListPage.jsx
import { Link } from "react-router-dom";
import { FilePenLine, Eye, Lock, Key } from "lucide-react";

// điều hướng sang các trang thêm trang sửa
export default function ProductsListPage({ products, handleKey, handleLock }) {
  return (
    <div className="overflow-x-auto p-4 bg-transparent">
      <table className="min-w-full rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-900">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="py-4 px-4 text-center text-sm font-bold text-gray-700 dark:text-gray-100 tracking-wide">
              SKU
            </th>
            <th className="py-4 px-4 text-center text-sm font-bold text-gray-700 dark:text-gray-100 tracking-wide">
              Tên sản phẩm (Tạm)
            </th>
            <th className="py-4 px-4 text-center text-sm font-bold text-gray-700 dark:text-gray-100 tracking-wide">
              Giá
            </th>
            <th className="py-4 px-4 text-center text-sm font-bold text-gray-700 dark:text-gray-100 tracking-wide">
              Trạng thái
            </th>
            <th className="py-4 px-4 text-center text-sm font-bold text-gray-700 dark:text-gray-100 tracking-wide">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <td className="py-4 px-4 text-center text-sm text-gray-900 dark:text-gray-100 font-mono tracking-wider">{product.sku}</td>
              <td className="py-4 px-4 text-center text-sm text-gray-900 dark:text-gray-100">
                Sản phẩm #{product.id}
              </td>
              <td className="py-4 px-4 text-center text-sm text-gray-900 dark:text-gray-100">
                {product.import_price.toLocaleString()}đ
              </td>
              <td className="py-4 px-4 text-center text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                    product.status === 1
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : product.status === 2
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      : product.status === 3
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : product.status === 4
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {product.status === 1
                    ? "Đang bán"
                    : product.status === 2
                    ? "Đang chờ duyệt"
                    : product.status === 3
                    ? "Đã hủy"
                    : product.status === 4
                    ? "Đã bán"
                    : "Không rõ"}
                </span>

              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex justify-center gap-3">
                  {/* NÚT XEM CHI TIẾT */}
                  <Link
                    to={`/partner/products/${product.id}`}
                    title="Xem chi tiết"
                  >
                    <Eye
                      className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 cursor-pointer transition"
                      size={20}
                    />
                  </Link>

                  {/* NÚT CHỈNH SỬA */}
                  <Link
                    to={`/partner/products/${product.id}/edit`}
                    title="Chỉnh sửa"
                  >
                    <FilePenLine
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 cursor-pointer transition"
                      size={20}
                    />
                  </Link>
                  {/* NÚT KHÓA: luôn hiển thị, chỉ cho bấm khi status === 2 */}
                  <button
                    onClick={() => product.status === 2 && handleLock(product.id)}
                    title={product.status === 2 ? "Hủy Bán" : "Không thể hủy"}
                    disabled={product.status !== 2}
                    className={`rounded-full p-1 ${product.status === 2 ? "" : "opacity-50 cursor-not-allowed"}`}
                  >
                    <Lock
                      className={
                        product.status === 2
                          ? "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 cursor-pointer"
                          : "text-gray-400 dark:text-gray-500"
                      }
                      size={20}
                    />
                  </button>
                  {/* NÚT BÁN LẠI: chỉ hiện khi status === 3 */}
                  {product.status === 3 && (
                    <button
                      onClick={() => handleKey(product.id)}
                      title="Bán Lại"
                      className="rounded-full p-1"
                    >
                      <Key
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 cursor-pointer transition"
                        size={20}
                      />
                    </button>
                  )}
                  {/* NÚT XÓA */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
