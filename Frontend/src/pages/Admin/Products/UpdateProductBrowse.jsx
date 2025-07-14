import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoaderCircle, Eye, EyeOff, X } from "lucide-react";
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
    setModalData({
      price: "",
      sale: "",
      newPassword: "",
    });
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
        err.response?.data?.message || "Cập nhật sản phẩm thất bại, vui lòng thử lại."
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
        err.response?.data?.message || "Từ chối sản phẩm thất bại, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-lg transition border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-medium">Quay lại</span>
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-100 ml-2">
          Thông tin: #{formData.sku}
        </h2>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {product ? (
        <div className="space-y-8">
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
                <label htmlFor="import_price" className="block mb-1 text-sm">
                  Giá gốc
                </label>
                <input
                  name="import_price"
                  type="number"
                  value={formData.import_price}
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

          <div className="pt-6 flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-red-400"
            >
              {isLoading ? "Đang xử lý..." : "Từ chối sản phẩm"}
            </button>
            <button
              type="button"
              onClick={handleAcceptClick}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Đang xử lý..." : "Chấp nhận sản phẩm"}
            </button>
          </div>
        </div>
      ) : (
        <p>{error || "Không có dữ liệu để hiển thị."}</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[110]">
          {/* Overlay nền mờ */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-[110]"></div>
          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 w-full max-w-md mx-4 z-[111] transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Cấu hình sản phẩm
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Giá bán *
                </label>
                <input
                  type="number"
                  name="price"
                  value={modalData.price}
                  onChange={handleModalInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  placeholder="Nhập giá bán"
                />
                {modalErrors.price && (
                  <div className="text-red-500 text-xs mt-1">{modalErrors.price}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Giá sale
                </label>
                <input
                  type="number"
                  name="sale"
                  value={modalData.sale}
                  onChange={handleModalInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  placeholder="Nhập giá sale (tùy chọn)"
                />
                {modalErrors.sale && (
                  <div className="text-red-500 text-xs mt-1">{modalErrors.sale}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={modalData.newPassword}
                  onChange={handleModalInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  placeholder="Nhập mật khẩu mới (tùy chọn)"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 disabled:bg-blue-400 dark:disabled:bg-blue-300 transition"
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