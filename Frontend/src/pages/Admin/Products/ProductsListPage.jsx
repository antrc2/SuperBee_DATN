// @pages/Admin/Products/ProductsListPage.jsx
import { Link } from "react-router-dom";
import { FilePenLine, Eye, Lock, Key } from "lucide-react";

export default function ProductsListPage({ products, handleKey, handleLock }) {
  if (products.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Không tìm thấy sản phẩm nào.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th scope="col" className="py-3 px-6">
              SKU
            </th>
            <th scope="col" className="py-3 px-6">
              Tên sản phẩm
            </th>
            <th scope="col" className="py-3 px-6">
              Giá
            </th>
            <th scope="col" className="py-3 px-6">
              Trạng thái
            </th>
            <th scope="col" className="py-3 px-6 text-center">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors"
            >
              <td className="py-4 px-6 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {product.sku}
              </td>
              <td className="py-4 px-6">Sản phẩm #{product.id}</td>
              <td className="py-4 px-6">{product.price.toLocaleString()}đ</td>
              <td className="py-4 px-6">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.status === 1
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : product.status === 2
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      : product.status === 3
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : product.status === 4
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300"
                  }`}
                >
                  {product.status === 1
                    ? "Đang bán"
                    : product.status === 2
                    ? "Chờ duyệt"
                    : product.status === 3
                    ? "Không Bán"
                    : product.status === 4
                    ? "Bán thành công"
                    : "Bị từ chối"}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-center items-center gap-4">
                  <Link
                    to={`/admin/products/${product.id}`}
                    title="Xem chi tiết"
                  >
                    <Eye
                      className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
                      size={20}
                    />
                  </Link>
                  {product.status === 4 || product.status == 0 ? (
                    <span className="px-7"></span> // Nếu status là 4, không hiển thị gì cả
                  ) : (
                    // Nếu status khác 4, hiển thị các nút hành động
                    <>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        title="Chỉnh sửa"
                      >
                        <FilePenLine
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          size={20}
                        />
                      </Link>

                      {product.status === 1 ? (
                        <button
                          onClick={() => handleLock(product.id)}
                          title="Hủy Bán"
                        >
                          <Lock
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                            size={20}
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleKey(product.id)}
                          title="Bán Lại"
                        >
                          <Key
                            className="text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 cursor-pointer"
                            size={20}
                          />
                        </button>
                      )}
                    </>
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
