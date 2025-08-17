// components/Admin/BusinessSettings/BusinessSettingsForm.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/http";
import { Switch, message } from "antd";

// --- CÁC COMPONENT GIAO DIỆN NHỎ ---
const Label = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
  >
    {children}
  </label>
);

const Input = ({ hasError, ...props }) => (
  <input
    {...props}
    className={`mt-2 block w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50
      ${
        hasError
          ? "border-red-500 text-red-600"
          : "border-slate-300 dark:border-slate-700"
      }`}
  />
);

const TextArea = ({ hasError, ...props }) => (
  <textarea
    {...props}
    className={`mt-2 block w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50
      ${
        hasError
          ? "border-red-500 text-red-600"
          : "border-slate-300 dark:border-slate-700"
      }`}
  />
);

const Select = ({ hasError, ...props }) => (
  <select
    {...props}
    className={`mt-2 block w-full rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50
      ${
        hasError
          ? "border-red-500 text-red-600"
          : "border-slate-300 dark:border-slate-700"
      }`}
  >
    {props.children}
  </select>
);

// --- COMPONENT FORM CHÍNH ---
export default function SettingsForm() {
  // --- STATE ---
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
    header_settings: "",
    footer_settings: "",
    auto_post: false,
    auto_transaction: false,
    auto_post_interval: 90,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // --- LOGIC ---
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/settings");
      setFormData({
        ...response.data,
        header_settings: response.data.header_settings ? JSON.stringify(response.data.header_settings, null, 2) : "",
        footer_settings: response.data.footer_settings ? JSON.stringify(response.data.footer_settings, null, 2) : "",
      });
    } catch (error) {
      message.error("Lỗi khi tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.shop_name) {
      newErrors.shop_name = "Vui lòng nhập tên shop.";
    }
    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      newErrors.logo_url = "Vui lòng nhập URL hợp lệ.";
    }
    if (formData.favicon_url && !isValidUrl(formData.favicon_url)) {
      newErrors.favicon_url = "Vui lòng nhập URL hợp lệ.";
    }
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ.";
    }
    if (formData.zalo_link && !isValidUrl(formData.zalo_link)) {
      newErrors.zalo_link = "Vui lòng nhập URL hợp lệ.";
    }
    if (formData.facebook_link && !isValidUrl(formData.facebook_link)) {
      newErrors.facebook_link = "Vui lòng nhập URL hợp lệ.";
    }
    if (!formData.template_name) {
      newErrors.template_name = "Vui lòng chọn template.";
    }
    if (formData.header_settings && !isValidJson(formData.header_settings)) {
      newErrors.header_settings = "Cài đặt header phải là JSON hợp lệ.";
    }
    if (formData.footer_settings && !isValidJson(formData.footer_settings)) {
      newErrors.footer_settings = "Cài đặt footer phải là JSON hợp lệ.";
    }
    if (formData.auto_post_interval <= 0 || formData.auto_post_interval > 1440) {
      newErrors.auto_post_interval = "Giá trị phải từ 1 đến 1440 phút.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Nếu không có lỗi, submit
    const dataToSubmit = {
      ...formData,
      header_settings: formData.header_settings ? JSON.parse(formData.header_settings) : null,
      footer_settings: formData.footer_settings ? JSON.parse(formData.footer_settings) : null,
    };
    try {
      setLoading(true);
      await api.put("/admin/settings", dataToSubmit);
      message.success("Cấu hình đã được cập nhật.");
      // Có thể redirect về page xem nếu cần
    } catch (error) {
      message.error("Lỗi khi cập nhật cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidJson = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  // --- GIAO DIỆN ---
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
          <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
            Thông tin cơ bản
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Thiết lập thông tin cơ bản của website.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="shop_name">Tên Shop</Label>
              <Input
                id="shop_name"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="Ví dụ: My Shop"
                hasError={!!errors.shop_name}
              />
              {errors.shop_name && <p className="mt-1 text-sm text-red-600">{errors.shop_name}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="slogan">Slogan</Label>
              <Input
                id="slogan"
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                placeholder="Ví dụ: Best Deals Online"
                hasError={!!errors.slogan}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="logo_url">URL Logo</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                hasError={!!errors.logo_url}
              />
              {errors.logo_url && <p className="mt-1 text-sm text-red-600">{errors.logo_url}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="favicon_url">URL Favicon</Label>
              <Input
                id="favicon_url"
                name="favicon_url"
                value={formData.favicon_url}
                onChange={handleChange}
                placeholder="https://example.com/favicon.ico"
                hasError={!!errors.favicon_url}
              />
              {errors.favicon_url && <p className="mt-1 text-sm text-red-600">{errors.favicon_url}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="phone_number">Số Điện Thoại</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0123456789"
                hasError={!!errors.phone_number}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                hasError={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="address">Địa Chỉ</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Street, City"
                hasError={!!errors.address}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="zalo_link">Link Zalo</Label>
              <Input
                id="zalo_link"
                name="zalo_link"
                value={formData.zalo_link}
                onChange={handleChange}
                placeholder="https://zalo.me/..."
                hasError={!!errors.zalo_link}
              />
              {errors.zalo_link && <p className="mt-1 text-sm text-red-600">{errors.zalo_link}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="facebook_link">Link Facebook</Label>
              <Input
                id="facebook_link"
                name="facebook_link"
                value={formData.facebook_link}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                hasError={!!errors.facebook_link}
              />
              {errors.facebook_link && <p className="mt-1 text-sm text-red-600">{errors.facebook_link}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="template_name">Tên Template</Label>
              <Select
                id="template_name"
                name="template_name"
                value={formData.template_name}
                onChange={handleChange}
                hasError={!!errors.template_name}
              >
                <option value="default">Default</option>
                <option value="template1">Template 1</option>
                <option value="template2">Template 2</option>
              </Select>
              {errors.template_name && <p className="mt-1 text-sm text-red-600">{errors.template_name}</p>}
            </div>
          </div>
        </div>
        <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
          <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
            Cài đặt Header và Footer
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Thiết lập cài đặt header và footer dưới dạng JSON.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="header_settings">Header Settings (JSON)</Label>
              <TextArea
                id="header_settings"
                name="header_settings"
                rows={6}
                value={formData.header_settings}
                onChange={handleChange}
                placeholder='{"key": "value"}'
                hasError={!!errors.header_settings}
              />
              {errors.header_settings && <p className="mt-1 text-sm text-red-600">{errors.header_settings}</p>}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="footer_settings">Footer Settings (JSON)</Label>
              <TextArea
                id="footer_settings"
                name="footer_settings"
                rows={6}
                value={formData.footer_settings}
                onChange={handleChange}
                placeholder='{"key": "value"}'
                hasError={!!errors.footer_settings}
              />
              {errors.footer_settings && <p className="mt-1 text-sm text-red-600">{errors.footer_settings}</p>}
            </div>
          </div>
        </div>
        <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
          <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
            Cài đặt Tự Động
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Thiết lập các tính năng tự động.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="auto_post">Auto Post</Label>
              <Switch
                checked={formData.auto_post}
                onChange={(checked) => setFormData((prev) => ({ ...prev, auto_post: checked }))}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="auto_transaction">Auto Transaction</Label>
              <Switch
                checked={formData.auto_transaction}
                onChange={(checked) => setFormData((prev) => ({ ...prev, auto_transaction: checked }))}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="auto_post_interval">Auto Post Interval (phút)</Label>
              <Input
                id="auto_post_interval"
                name="auto_post_interval"
                type="number"
                value={formData.auto_post_interval}
                onChange={handleChange}
                placeholder="90"
                hasError={!!errors.auto_post_interval}
              />
              {errors.auto_post_interval && <p className="mt-1 text-sm text-red-600">{errors.auto_post_interval}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Cập nhật Cấu Hình"}
        </button>
      </div>
    </form>
  );
}