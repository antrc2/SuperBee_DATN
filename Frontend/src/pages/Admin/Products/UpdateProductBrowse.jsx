// UpdateProductBrowse.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoaderCircle, Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import api from "../../../utils/http";

export default function UpdateProductBrowse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    price: "",
    sale: "",
    newPassword: "",
  });
  const [modalErrors, setModalErrors] = useState({});

  const [formData, setFormData] = useState({
    sku: "",
    category_id: "",
    category_name: "",
    import_price: "",
    username: "",
    password: "",
    attributes: [{ attribute_key: "", attribute_value: "" }],
    images: [],
  });
  console.log("🚀 ~ UpdateProductBrowse ~ formData:", formData);

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
            import_price: productItem.import_price || "",
            username: productItem.credentials?.[0]?.username || "",
            password: productItem.credentials?.[0]?.password || "",
            attributes: productItem.game_attributes || [
              { attribute_key: "", attribute_value: "" },
            ],
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

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };

  const validateModalForm = () => {
    const errors = {};
    if (!modalData.price) {
      errors.price = "Vui lòng nhập giá bán.";
    } else if (Number(modalData.price) <= Number(formData.import_price)) {
      errors.price = "Giá bán phải lớn hơn giá gốc.";
    }
    if (modalData.sale && Number(modalData.sale) >= Number(modalData.price)) {
      errors.sale = "Giá sale phải nhỏ hơn giá bán.";
    }
    return errors;
  };

  const handleAcceptClick = () => {
    setModalData({ price: "", sale: "", newPassword: "" });
    setModalErrors({});
    setShowModal(true);
  };

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    setModalErrors({});

    const errors = validateModalForm();
    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("price", modalData.price);
      payload.append("sale", modalData.sale);
      payload.append("status", "1");
      payload.append("password", modalData.newPassword || formData.password);

      const response = await api.post(`/admin/products/${id}/accept`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        setShowModal(false);
        navigate("/admin/products");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Cập nhật sản phẩm thất bại, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/admin/products/${id}/deny`);
      if (response.status === 201 || response.status === 200) {
        navigate("/admin/products");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Từ chối sản phẩm thất bại, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm dark:shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại</span>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Thông tin chi tiết:{" "}
            <span className="text-blue-500 dark:text-blue-400 font-mono">
              #{formData.sku}
            </span>
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {product ? (
          <div className="space-y-8">
            {/* Base Info */}
            <div className="p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg">
              <h3 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
                Thông tin cơ bản
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category_name"
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Danh mục
                  </label>
                  <input
                    name="category_name"
                    id="category_name"
                    value={formData.category_name}
                    readOnly
                    className="w-full p-2.5 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label
                    htmlFor="import_price"
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Giá gốc
                  </label>
                  <input
                    name="import_price"
                    type="number"
                    value={formData.import_price}
                    readOnly
                    className="w-full p-2.5 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg">
              <h3 className="text-lg font-semibold leading-6 text-gray-800 dark:text-white mb-4">
                Thông tin đăng nhập
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                  >
                    Tài khoản đăng nhập
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    readOnly
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 p-2.5 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
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
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 p-2.5 cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg">
              <h3 className="text-lg font-semibold leading-6 text-gray-800 dark:text-white mb-4">
                Thuộc tính sản phẩm
              </h3>
              <div className="space-y-4">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Tên thuộc tính"
                      value={attr.attribute_key}
                      readOnly
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 p-2.5 cursor-not-allowed"
                    />
                    <input
                      type="text"
                      placeholder="Giá trị"
                      value={attr.attribute_value}
                      readOnly
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 p-2.5 cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg">
              <h3 className="text-lg font-semibold leading-6 text-gray-800 dark:text-white mb-2">
                Hình ảnh minh họa
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Đã chọn: {formData.images.length} / 5 ảnh.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {formData.images.map((img, index) => (
                  <div
                    key={img.id || index}
                    className="relative aspect-square border-2 border-gray-300 dark:border-gray-700 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900"
                  >
                    <img
                      src={`${img.image_url}`}
                      alt={img.alt_text || "Ảnh sản phẩm"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto bg-red-500 dark:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-400 dark:hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Đang xử lý..." : "Từ chối sản phẩm"}
              </button>
              <button
                type="button"
                onClick={handleAcceptClick}
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-500 dark:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-400 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Đang xử lý..." : "Chấp nhận sản phẩm"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            {error || "Không có dữ liệu để hiển thị."}
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoading && setShowModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg dark:shadow-2xl p-6 sm:p-8 w-full max-w-md mx-4 z-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Cấu hình sản phẩm
              </h3>
              <button
                onClick={() => !isLoading && setShowModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={modalData.price}
                  onChange={handleModalInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-shadow"
                  placeholder="Nhập giá bán"
                />
                {modalErrors.price && (
                  <div className="text-red-500 dark:text-red-400 text-xs mt-1.5">
                    {modalErrors.price}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Giá sale (Tùy chọn)
                </label>
                <input
                  type="number"
                  name="sale"
                  value={modalData.sale}
                  onChange={handleModalInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-shadow"
                  placeholder="Nhập giá sale"
                />
                {modalErrors.sale && (
                  <div className="text-red-500 dark:text-red-400 text-xs mt-1.5">
                    {modalErrors.sale}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mật khẩu mới (Tùy chọn)
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={modalData.newPassword}
                  onChange={handleModalInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-shadow"
                  placeholder="Để trống nếu không muốn đổi"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8">
              <button
                type="button"
                onClick={() => !isLoading && setShowModal(false)}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-400 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-wait transition-colors"
              >
                {isLoading ? "Đang xử lý..." : "Chấp nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
