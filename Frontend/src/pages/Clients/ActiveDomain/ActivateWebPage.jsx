// src/pages/ActivateWebPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Dùng để điều hướng

// Import các icon cần dùng từ lucide-react
import {
  Store,
  Tag,
  Image,
  Link,
  Phone,
  Mail,
  Home,
  MessageCircle,
  Facebook,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

function ActivateWebPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shop_name: "",
    slogan: "",
    logo_url: "",
    favicon_url: "",
    phone_number: "",
    email: "",
    address: "",
    zalo_link: "",
    facebook_link: "",
    template_name: "default", // Mặc định là 'default'
    header_settings: null, // Sẽ là object/null
    footer_settings: null, // Sẽ là object/null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleJsonChange = (name, value) => {
    try {
      const parsedValue = value ? JSON.parse(value) : null;
      setFormData({
        ...formData,
        [name]: parsedValue,
      });
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Dữ liệu không phải JSON hợp lệ.",
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.shop_name)
      newErrors.shop_name = "Tên Shop không được để trống.";
    if (!formData.email) {
      newErrors.email = "Email không được để trống.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }
    if (formData.logo_url && !/^https?:\/\/\S+/.test(formData.logo_url)) {
      newErrors.logo_url = "URL Logo không hợp lệ.";
    }
    if (formData.favicon_url && !/^https?:\/\/\S+/.test(formData.favicon_url)) {
      newErrors.favicon_url = "URL Favicon không hợp lệ.";
    }
    if (formData.zalo_link && !/^\+?\d{9,15}$/.test(formData.zalo_link)) {
      newErrors.zalo_link = "URL Zalo không hợp lệ.";
    }
    if (
      formData.facebook_link &&
      !/^https?:\/\/\S+/.test(formData.facebook_link)
    ) {
      newErrors.facebook_link = "URL Facebook không hợp lệ.";
    }
    if (formData.phone_number && !/^\+?\d{9,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Số điện thoại không hợp lệ.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      setErrorMessage("Vui lòng kiểm tra lại các trường bị lỗi.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/activeWeb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Cập nhật web thành công! Đang chuyển hướng...");
        sessionStorage.setItem(
          "business_settings",
          JSON.stringify(data.business_settings)
        );
        navigate("/dashboard"); // Or '/'
      } else {
        setErrorMessage(data.message || "Có lỗi xảy ra khi Cập nhật web.");
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      console.error("Lỗi API:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full border-2 border-pink-300 transform transition-transform duration-500 hover:scale-105">
        {/* Header with Chibi/Wibu style */}
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-4 animate-bounce-slow">
          <Sparkles className="inline-block mr-2 w-10 h-10 text-yellow-400" />
          Chào mừng đến với Trang Cấu Hình Web!
          <Sparkles className="inline-block ml-2 w-10 h-10 text-yellow-400" />
        </h1>
        <p className="text-center text-gray-700 text-lg mb-8 font-semibold italic">
          Cùng tôi kiến tạo web game kawaii của riêng bạn!
          <br />
          Vui lòng điền thông tin để shop của bạn lung linh hơn nhé! ✨
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center flex items-center justify-center gap-2 animate-fade-in-down">
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center flex items-center justify-center gap-2 animate-fade-in-down">
              <XCircle className="w-5 h-5" />
              {errorMessage}
            </div>
          )}

          {/* --- Basic Shop Information --- */}
          <h2 className="text-2xl font-bold text-blue-500 border-b-2 border-blue-200 pb-3 mb-5 flex items-center gap-2">
            <Store className="inline-block w-6 h-6 text-blue-400" />
            Thông Tin Cơ Bản Của Shop
          </h2>

          {/* Grid Container for Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Input Field: Shop Name */}
            <div>
              <label
                htmlFor="shop_name"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Tag className="w-4 h-4 text-pink-500" /> Tên Shop{" "}
                <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                id="shop_name"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.shop_name ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Tên shop của bạn (ví dụ: Akihabara Gaming)"
              />
              {errors.shop_name && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.shop_name}
                </p>
              )}
            </div>

            {/* Input Field: Slogan */}
            <div>
              <label
                htmlFor="slogan"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4 text-indigo-500" />
                Slogan/Mô Tả Ngắn:
              </label>
              <input
                type="text"
                id="slogan"
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                className="shadow appearance-none border border-purple-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50"
                placeholder="Khẩu hiệu dễ thương (ví dụ: Nơi ước mơ gaming trở thành hiện thực!)"
              />
            </div>

            {/* Input Field: Logo URL */}
            <div>
              <label
                htmlFor="logo_url"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Image className="w-4 h-4 text-green-500" /> URL Logo:
              </label>
              <input
                type="text"
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.logo_url ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Link hình ảnh logo (ví dụ: https://example.com/logo.png)"
              />
              {errors.logo_url && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.logo_url}
                </p>
              )}
            </div>

            {/* Input Field: Favicon URL */}
            <div>
              <label
                htmlFor="favicon_url"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Link className="w-4 h-4 text-yellow-500" /> URL Favicon:
              </label>
              <input
                type="text"
                id="favicon_url"
                name="favicon_url"
                value={formData.favicon_url}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.favicon_url ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Link favicon (ví dụ: https://example.com/favicon.ico)"
              />
              {errors.favicon_url && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.favicon_url}
                </p>
              )}
            </div>

            {/* Input Field: Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Phone className="w-4 h-4 text-orange-500" /> Số Điện Thoại Liên
                Hệ:
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.phone_number ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Số điện thoại của shop"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.phone_number}
                </p>
              )}
            </div>

            {/* Input Field: Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Mail className="w-4 h-4 text-cyan-500" /> Email Liên Hệ{" "}
                <span className="text-red-500">*</span>:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.email ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Địa chỉ email liên hệ"
              />
              {errors.email && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Input Field: Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Home className="w-4 h-4 text-lime-500" /> Địa Chỉ Shop:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="shadow appearance-none border border-purple-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50"
                placeholder="Địa chỉ shop của bạn"
              />
            </div>

            {/* Input Field: Zalo Link */}
            <div>
              <label
                htmlFor="zalo_link"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4 text-blue-500" /> Link Zalo:
              </label>
              <input
                type="text"
                id="zalo_link"
                name="zalo_link"
                value={formData.zalo_link}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.zalo_link ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Link Zalo của shop"
              />
              {errors.zalo_link && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.zalo_link}
                </p>
              )}
            </div>

            {/* Input Field: Facebook Link */}
            <div>
              <label
                htmlFor="facebook_link"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1"
              >
                <Facebook className="w-4 h-4 text-blue-700" /> Link Facebook:
              </label>
              <input
                type="text"
                id="facebook_link"
                name="facebook_link"
                value={formData.facebook_link}
                onChange={handleChange}
                className={`shadow appearance-none border ${
                  errors.facebook_link ? "border-red-500" : "border-purple-300"
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-purple-400 bg-pink-50`}
                placeholder="Link Facebook của shop"
              />
              {errors.facebook_link && (
                <p className="text-red-500 text-xs italic mt-2">
                  {errors.facebook_link}
                </p>
              )}
            </div>
          </div>
          {/* End Grid Container */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xl shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Đang Cập nhật shop của
                bạn...
              </>
            ) : (
              <>
                <Sparkles /> Cập nhật Web Kawaii Ngay! <Sparkles />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ActivateWebPage;
