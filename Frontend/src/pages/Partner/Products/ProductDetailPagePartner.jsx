import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LoaderCircle, ArrowLeft, Edit } from "lucide-react";
import api from "../../../utils/http";

// Component con để hiển thị một mục thông tin
const DetailItem = ({ label, value, className = "" }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
      {label}
    </dt>
    <dd
      className={`mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 ${className}`}
    >
      {value}
    </dd>
  </div>
);

export default function ProductDetailPagePartner() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/partner/products/${id}`);
        const productData = response.data.data;
        if (productData && productData.id) {
          // Lấy sản phẩm và chuẩn hóa game_attributes thành mảng nếu cần
          if (
            productData.game_attributes &&
            !Array.isArray(productData.game_attributes)
          ) {
            productData.game_attributes = [productData.game_attributes];
          }
          setProduct(productData);
        } else {
          setProduct(null);
          setError("Sản phẩm không tồn tại.");
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError("Không thể tải chi tiết sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300 p-4 rounded-md">
        <p>{error}</p>
        <Link
          to="/partner/products"
          className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-200"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transition">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/partner/products"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Chi tiết sản phẩm {product.sku}
        </h1>

        {/* Thông tin chung */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <DetailItem label="SKU" value={product.sku} />
            <DetailItem
              label="Danh mục"
              value={product.category?.name || "Chưa phân loại"}
            />
            <DetailItem
              label="Giá Bán"
              value={`${product.import_price.toLocaleString()}đ`}
            />
            <DetailItem
              label="Mô tả"
              value={product.description || "Không có mô tả"}
            />
            <DetailItem
              label="Giá khuyến mãi"
              value={
                product.sale ? `${product.sale.toLocaleString()}đ` : "Không có"
              }
            />
            <DetailItem
              label="Trạng thái"
              value={(() => {
                let label = "";
                let style = "";
                switch (product.status) {
                  case 1:
                    label = "Đang bán";
                    style =
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                    break;
                  case 2:
                    label = "Chờ kiểm duyệt";
                    style =
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                    break;
                  case 3:
                    label = "Đã hủy bán";
                    style =
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
                    break;
                  case 4:
                    label = "Bán thành công";
                    style =
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                    break;
                  default:
                    label = "Không xác định";
                    style =
                      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
                }
                return (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${style}`}
                  >
                    {label}
                  </span>
                );
              })()}
            />
          </dl>
        </div>

        {/* Thông tin đăng nhập */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 border-b pb-2 border-gray-200 dark:border-gray-700">
            Thông tin đăng nhập
          </h3>
          {product.credentials && product.credentials.length > 0 ? (
            <div>
              {product.credentials.map((cred) => (
                <div key={cred.id} className="mb-4">
                  <dl>
                    <DetailItem label="Tài khoản" value={cred.username} />
                    <DetailItem label="Mật khẩu" value="****** (Bảo mật)" />
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Không có thông tin đăng nhập.
            </p>
          )}
        </div>

        {/* Thuộc tính game (EAV) */}
        {product.game_attributes && product.game_attributes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 border-b pb-2 border-gray-200 dark:border-gray-700">
              Thuộc tính riêng
            </h3>
            <dl>
              {product.game_attributes.map((attr) => (
                <DetailItem
                  key={attr.id}
                  label={attr.attribute_key}
                  value={attr.attribute_value}
                />
              ))}
            </dl>
          </div>
        )}

        {/* Hình ảnh sản phẩm */}
        {product.images && product.images.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 border-b pb-2 border-gray-200 dark:border-gray-700">
              Hình ảnh
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="border rounded-xl overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow"
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_IMG}${
                      image.image_url
                    }`}
                    alt={image.alt_text || `Ảnh sản phẩm ${product.sku}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thông tin bổ sung */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 border-b pb-2 border-gray-200 dark:border-gray-700">
            Thông tin bổ sung
          </h3>
          <dl>
            <DetailItem
              label="Ngày tạo"
              value={new Date(product.created_at).toLocaleString("vi-VN")}
            />
            <DetailItem
              label="Ngày cập nhật"
              value={new Date(product.updated_at).toLocaleString("vi-VN")}
            />
            <DetailItem label="Người tạo" value={product?.creator?.username} />
            <DetailItem
              label="Người cập nhật"
              value={product?.updater?.username}
            />
          </dl>
        </div>
      </div>
    </div>
  );
}
