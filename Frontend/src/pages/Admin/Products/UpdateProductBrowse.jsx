import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import api from "../../../utils/http";

export default function UpdateProductBrowse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    sku: "",
    category_id: "",
    category_name: "",
    price: "",
    sale: "",
    username: "",
    password: "",
    attributes: [{ attribute_key: "", attribute_value: "" }],
    images: [],
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`/admin/products/${id}`);
        const productData = response.data.data;
        if (Array.isArray(productData) && productData.length > 0) {
          const productItem = productData[0];
          setProduct(productItem);
          setFormData({
            sku: productItem.sku || "",
            category_id: productItem.category_id || "",
            category_name: productItem.category?.name || "",
            price: productItem.price || "",
            sale: productItem.sale || "",
            username: productItem.credentials[0]?.username || "",
            password: productItem.credentials[0]?.password || "",
            attributes: productItem.game_attributes || [{ attribute_key: "", attribute_value: "" }],
            images: productItem.images || [],
          });
        } else {
          setProduct(null);
          setError("Sản phẩm không tồn tại.");
        }
      } catch (err) {
        console.error(err);
        setError("Không tìm thấy sản phẩm hoặc có lỗi xảy ra.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdateSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      formData.append("status", "1");
      const response = await api.post(`/admin/products/${id}/accept`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 || response.status === 200) {
        navigate("/admin/products");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Cập nhật mật khẩu thất bại, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (newPassword) {
      formData.append("password", newPassword);
    }
    handleUpdateSubmit(formData);
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Thông tin: #{formData.sku}
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {product ? (
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <div className="p-6 border bg-white rounded shadow-sm">
            <h3 className="mb-4 font-medium text-gray-900">Thông tin cơ bản</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category_id" className="block mb-1 text-sm">
                  Danh mục
                </label>
                <input
                  name="category_name"
                  id="category_name"
                  value={formData.category_name}
                  readOnly
                  className="w-full p-2 rounded border bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="price" className="block mb-1 text-sm">
                  Giá gốc
                </label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  readOnly
                  className="w-full p-2 rounded border bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="sale" className="block mb-1 text-sm">
                  Giá sale
                </label>
                <input
                  name="sale"
                  type="number"
                  value={formData.sale}
                  readOnly
                  className="w-full p-2 rounded border bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Thông tin đăng nhập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tài khoản đăng nhập
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  readOnly
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    readOnly
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu sản phẩm mới (Bỏ trống nếu không đổi)
              </label>
              <input
                type="password"
                name="new_password"
                id="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Thuộc tính sản phẩm
            </h3>
            <div className="space-y-4">
              {formData.attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="text"
                    name="attribute_key"
                    placeholder="Tên thuộc tính"
                    value={attr.attribute_key}
                    readOnly
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100"
                  />
                  <input
                    type="text"
                    name="attribute_value"
                    placeholder="Giá trị"
                    value={attr.attribute_value}
                    readOnly
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Hình ảnh minh họa
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Đã chọn: {formData.images.length} / 5 ảnh.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {formData.images.map((img, index) => (
                <div
                  key={img.id || index}
                  className="relative aspect-square border rounded-md overflow-hidden"
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_IMG}${img.image_url}`}
                    alt={img.alt_text || "Ảnh sản phẩm"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !newPassword}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Đang lưu..." : "Cập Nhật Mật Khẩu"}
            </button>
          </div>
        </form>
      ) : (
        <p>{error || "Không có dữ liệu để hiển thị."}</p>
      )}
    </div>
  );
}