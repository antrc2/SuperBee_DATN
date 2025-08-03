import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
  Phone,
  Mail,
  Home,
  MessageSquare,
  Facebook,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  Code,
} from "lucide-react";
import api from "../../../utils/http";

// Component con cho Input để tái sử dụng, giúp code gọn gàng hơn
const InputField = ({ icon, label, name, error, required, ...props }) => {
  const Icon = icon;
  return (
    <div>
      <label
        htmlFor={name}
        className=" text-sm font-semibold text-secondary mb-2 flex items-center gap-2"
      >
        <Icon className="w-4 h-4 text-accent" />
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        className={`w-full rounded-lg px-4 py-3 bg-input text-input border-themed border-hover placeholder-theme ${
          error ? "border-red-500" : ""
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

export default function ActivateWebPage() {
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
    template_name: "default",
    header_settings: null,
    footer_settings: null,
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
      const response = await api.post("/activeWeb", formData);

      const data = response;

      if (response.status) {
        setSuccessMessage("Cập nhật web thành công! Đang chuyển hướng...");
        sessionStorage.setItem(
          "business_settings",
          JSON.stringify(data.business_settings)
        );
        navigate("/dashboard");
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-content-bg border border-themed rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-themed bg-gradient-to-r from-background to-content-bg">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              Cấu hình Shop của bạn
            </h1>
            <p className="text-secondary mt-2">
              Hãy điền các thông tin dưới đây để shop của bạn trông thật lung
              linh và chuyên nghiệp nhé!
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="alert alert-danger">
                <XCircle className="w-5 h-5 mr-2" />
                {errorMessage}
              </div>
            )}

            {/* Section: Basic Info */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-primary flex items-center gap-3 border-b border-themed/50 pb-3 mb-6">
                <Store /> Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  icon={Tag}
                  label="Tên Shop"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                  error={errors.shop_name}
                  required
                  placeholder="Akihabara Gaming"
                />
                <InputField
                  icon={ImageIcon}
                  label="URL Logo"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  error={errors.logo_url}
                  placeholder="https://example.com/logo.png"
                />
                <InputField
                  icon={LinkIcon}
                  label="URL Favicon"
                  name="favicon_url"
                  value={formData.favicon_url}
                  onChange={handleChange}
                  error={errors.favicon_url}
                  placeholder="https://example.com/favicon.ico"
                />
                <InputField
                  icon={MessageSquare}
                  label="Slogan/Mô tả ngắn"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  placeholder="Nơi ước mơ gaming trở thành sự thật!"
                />
              </div>
            </section>

            {/* Section: Contact Info */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-primary flex items-center gap-3 border-b border-themed/50 pb-3 mb-6">
                <Phone /> Thông tin liên hệ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  icon={Mail}
                  label="Email Liên Hệ"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="contact@shop.com"
                />
                <InputField
                  icon={Phone}
                  label="Số Điện Thoại"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={errors.phone_number}
                  placeholder="09xxxxxxxx"
                />
                <InputField
                  icon={Home}
                  label="Địa Chỉ Shop"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Đường Anime, Quận Manga..."
                />
                <InputField
                  icon={MessageSquare}
                  label="Link Zalo"
                  name="zalo_link"
                  value={formData.zalo_link}
                  onChange={handleChange}
                  error={errors.zalo_link}
                  placeholder="Link Zalo của shop"
                />
                <InputField
                  icon={Facebook}
                  label="Link Facebook"
                  name="facebook_link"
                  value={formData.facebook_link}
                  onChange={handleChange}
                  error={errors.facebook_link}
                  placeholder="Link trang Facebook của shop"
                />
              </div>
            </section>

            {/* Section: Advanced Settings */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-primary flex items-center gap-3 border-b border-themed/50 pb-3 mb-6">
                <Settings /> Cấu hình nâng cao (JSON)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="header_settings"
                    className="block text-sm font-semibold text-secondary mb-2 flex items-center gap-2"
                  >
                    <Code /> Header Settings (JSON)
                  </label>
                  <textarea
                    id="header_settings"
                    rows="5"
                    onChange={(e) =>
                      handleJsonChange("header_settings", e.target.value)
                    }
                    className={`w-full font-mono text-sm rounded-lg p-3 bg-input text-input border-themed border-hover placeholder-theme ${
                      errors.header_settings ? "border-red-500" : ""
                    }`}
                    placeholder='{ "key": "value" }'
                  ></textarea>
                  {errors.header_settings && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.header_settings}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="footer_settings"
                    className="block text-sm font-semibold text-secondary mb-2 flex items-center gap-2"
                  >
                    <Code /> Footer Settings (JSON)
                  </label>
                  <textarea
                    id="footer_settings"
                    rows="5"
                    onChange={(e) =>
                      handleJsonChange("footer_settings", e.target.value)
                    }
                    className={`w-full font-mono text-sm rounded-lg p-3 bg-input text-input border-themed border-hover placeholder-theme ${
                      errors.footer_settings ? "border-red-500" : ""
                    }`}
                    placeholder='{ "copyright": "Your Shop" }'
                  ></textarea>
                  {errors.footer_settings && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.footer_settings}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Footer with Submit Button */}
          <div className="p-6 bg-background/50 border-t border-themed flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="action-button action-button-primary !w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang lưu cấu
                  hình...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" /> Lưu và Kích hoạt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
