// @pages/Admin/Products/ProductsListPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePenLine, LoaderCircle, Eye, Lock, Key } from "lucide-react";
import ProductsPageLayout from "./ProductsPageLayout";
import api from "@utils/http"; // Giả sử bạn có một file api.js để cấu hình axios
export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products"); // API trả về { data: [...] }
      setProducts(response.data.data); // Giả sử API trả về data trong response.data.data
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLock = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn Khóa sản phẩm này?")) {
      try {
        const res = await api.post(`/admin/products/${id}/cancel`);
        fetchProducts();
        // toast.success("Xóa sản phẩm thành công!");
      } catch (err) {
        // toast.error("Lỗi! Không thể xóa sản phẩm.");
        console.error(err);
      }
    }
  };
  const handleKey = async (id) => {
    try {
      const res = await api.post(`/admin/products/${id}/restore`);
      // Cập nhật lại state sau khi xóa thành công
      fetchProducts();
    } catch (err) {
      // toast.error("Lỗi! Không thể xóa sản phẩm.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <ProductsPageLayout>
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
                <td className="py-3 px-4 text-sm text-gray-700">
                  {product.sku}
                </td>
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
    </ProductsPageLayout>
  );
}
