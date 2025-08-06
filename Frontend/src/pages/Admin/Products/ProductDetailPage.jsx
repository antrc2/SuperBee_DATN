import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LoaderCircle, ArrowLeft, Edit } from "lucide-react";
import api from "../../../utils/http";

// --- Helper Components for Clean UI ---

// Card component for grouping information
const InfoCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
    <div className="p-4 sm:p-6">
      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </dl>
      </div>
    </div>
  </div>
);

// Component to display a single detail item (label and value)
const DetailItem = ({ label, children }) => (
  <div className="py-3 sm:py-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
      {children}
    </dd>
  </div>
);

// Component for displaying status with colors
const StatusBadge = ({ status }) => {
  let label = "";
  let style = "";

  switch (status) {
    case 1:
      label = "Đang bán";
      style =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      break;
    case 2:
      label = "Chờ duyệt";
      style =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      break;
    case 3:
      label = "Đã hủy";
      style = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      break;
    case 4:
      label = "Bán thành công";
      style = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      break;
    default:
      label = "Bị từ chối";
      style =
        "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300";
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>
      {label}
    </span>
  );
};

// --- Main Page Component ---

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/admin/products/${id}`);
        const productData = response.data.data;
        if (Array.isArray(productData) && productData.length > 0) {
          const productItem = productData[0];
          if (
            productItem.game_attributes &&
            !Array.isArray(productItem.game_attributes)
          ) {
            productItem.game_attributes = [productItem.game_attributes];
          }
          setProduct(productItem);
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
        <LoaderCircle className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-8 text-center text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
        <p className="font-semibold">{error}</p>
        <Link
          to="/admin/products"
          className="mt-4 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Chi tiết sản phẩm
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            SKU:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {product.sku}
            </span>
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Link
            to="/admin/products"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </Link>
          <Link
            to={`/admin/products/${product.id}/edit`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Edit size={16} />
            <span>Chỉnh sửa</span>
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Thông tin chung">
            <DetailItem label="Danh mục">
              {product.category?.name || "Chưa phân loại"}
            </DetailItem>
            <DetailItem label="Giá bán">{`${product.price.toLocaleString()}đ`}</DetailItem>
            <DetailItem label="Giá nhập">{`${product.import_price.toLocaleString()}đ`}</DetailItem>
            <DetailItem label="Giá sale">
              {product.sale ? `${product.sale.toLocaleString()}đ` : "Không có"}
            </DetailItem>
            <DetailItem label="Trạng thái">
              <StatusBadge status={product.status} />
            </DetailItem>
            <DetailItem label="Mô tả">
              {product.description || "Không có mô tả"}
            </DetailItem>
          </InfoCard>

          {product.game_attributes && product.game_attributes.length > 0 && (
            <InfoCard title="Thuộc tính riêng">
              {product.game_attributes.map((attr) => (
                <DetailItem key={attr.id} label={attr.attribute_key}>
                  {attr.attribute_value}
                </DetailItem>
              ))}
            </InfoCard>
          )}

          {product.credentials && product.credentials.length > 0 && (
            <InfoCard title="Thông tin đăng nhập">
              {product.credentials.map((cred) => (
                <React.Fragment key={cred.id}>
                  <DetailItem label="Tài khoản">{cred.username}</DetailItem>
                  <DetailItem label="Mật khẩu">{cred.password}</DetailItem>
                </React.Fragment>
              ))}
            </InfoCard>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {product.images && product.images.length > 0 && (
            <InfoCard title="Hình ảnh">
              <div className="grid grid-cols-2 gap-4 pt-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square border dark:border-gray-600 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `Ảnh sản phẩm ${product.sku}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          <InfoCard title="Thông tin bổ sung">
            <DetailItem label="Ngày tạo">
              {new Date(product.created_at).toLocaleString("vi-VN")}
            </DetailItem>
            <DetailItem label="Cập nhật lần cuối">
              {new Date(product.updated_at).toLocaleString("vi-VN")}
            </DetailItem>
            <DetailItem label="Người tạo">
              {product.creator?.username || "Không rõ"}
            </DetailItem>
            <DetailItem label="Người sửa">
              {product.updater?.username || "Chưa có"}
            </DetailItem>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
