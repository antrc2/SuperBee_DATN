// @pages/Admin/Products/ProductsListPage.jsx
import { Link } from "react-router-dom";
import { FilePenLine, Eye, Lock, Key } from "lucide-react";

// điều hướng sang các trang thêm trang sửa
export default function ProductsListPage({ products, handleKey, handleLock }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              SKU
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Tên sản phẩm (Tạm)
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Giá
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700">{product.sku}</td>
              <td className="py-3 px-4 text-sm text-gray-700">
                Sản phẩm #{product.id}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">
                {product.price.toLocaleString()}đ
              </td>
              <td className="py-3 px-4 text-sm">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.status === 1 ? "Đang bán" : "Không bán"}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center gap-4">
                  {/* NÚT XEM CHI TIẾT */}
                  <Link
                    to={`/admin/products/${product.id}`}
                    title="Xem chi tiết"
                  >
                    <Eye
                      className="text-green-500 hover:text-green-700 cursor-pointer"
                      size={20}
                    />
                  </Link>

                  {/* NÚT CHỈNH SỬA */}
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    title="Chỉnh sửa"
                  >
                    <FilePenLine
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      size={20}
                    />
                  </Link>
                  {product.status === 1 ? (
                    <button
                      onClick={() => handleLock(product.id)}
                      title="Hủy Bán"
                    >
                      <Lock
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        size={20}
                      />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleKey(product.id)}
                      title="Bán Lại"
                    >
                      <Key
                        className="text-red-500 hover:text-red-700 cursor-pointer"
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
