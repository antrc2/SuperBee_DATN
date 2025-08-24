// BusinessSettings/BusinessSettingPage newest
import React, { useState, useEffect, useRef } from 'react';
import api from '../../../utils/http';
import { Settings, Edit, Save, X, Globe, Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';
import { useNotification } from "@contexts/NotificationContext";
import LoadingDomain from "@components/Loading/LoadingDomain";

const BusinessSettingPage = () => {
  const { pop } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    id: 1,
    shop_name: '',
    slogan: '',
    logo_url: '',
    favicon_url: '',
    phone_number: '',
    email: '',
    address: '',
    zalo_link: '',
    facebook_link: '',
    template_name: 'default',
    auto_post: false,
    auto_transaction: false,
    auto_post_interval: 60
  });

  const [editConfig, setEditConfig] = useState(config);
  const [logoExisting, setLogoExisting] = useState(null);
  const [faviconExisting, setFaviconExisting] = useState(null);
  const [logoNew, setLogoNew] = useState(null);
  const [faviconNew, setFaviconNew] = useState(null);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Fetch config from API
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/business_settings');

        if (response.data.status && response.data.data) {
          const configData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data;

          const normalizedConfig = {
            ...configData,
            auto_post: !!configData.auto_post,
            auto_transaction: !!configData.auto_transaction,
            shop_name: configData.shop_name || "", // Ensure shop_name is not null
            template_name: configData.template_name || "default", // Ensure template_name is not null
          };

          setConfig(normalizedConfig);
          setEditConfig(normalizedConfig);
          setLogoExisting(
            configData.logo_url ? { image_url: configData.logo_url } : null
          );
          setFaviconExisting(
            configData.favicon_url
              ? { image_url: configData.favicon_url }
              : null
          );
          setLogoNew(null);
          setFaviconNew(null);
        } else {
          console.error("error:", response.data.message);
          pop(response.data.message || "Không thể tải dữ liệu cấu hình");
        }
      } catch (error) {
        console.error("Error:", error);
        pop("Có lỗi xảy ra khi tải dữ liệu: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    return () => {
      if (logoNew) URL.revokeObjectURL(logoNew.preview);
      if (faviconNew) URL.revokeObjectURL(faviconNew.preview);
    };
  }, [logoNew, faviconNew]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditConfig({ ...config });
    setLogoExisting(config.logo_url ? { image_url: config.logo_url } : null);
    setFaviconExisting(
      config.favicon_url ? { image_url: config.favicon_url } : null
    );
    setLogoNew(null);
    setFaviconNew(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditConfig(config);
    setLogoExisting(config.logo_url ? { image_url: config.logo_url } : null);
    setFaviconExisting(
      config.favicon_url ? { image_url: config.favicon_url } : null
    );
    setLogoNew(null);
    setFaviconNew(null);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      if (!editConfig.shop_name) {
        throw new Error("Tên cửa hàng là bắt buộc.");
      }
      if (!editConfig.template_name) {
        throw new Error("Template là bắt buộc.");
      }

      if (!logoExisting && !logoNew) {
        throw new Error("Vui lòng chọn một ảnh logo.");
      }
      if (!faviconExisting && !faviconNew) {
        throw new Error("Vui lòng chọn một ảnh favicon.");
      }

      const formData = new FormData();
      Object.entries(editConfig).forEach(([key, value]) => {
        if (key !== "id" && key !== "logo_url" && key !== "favicon_url") {
          if (key === "auto_post" || key === "auto_transaction") {
            formData.append(key, value ? 1 : 0);
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        }
      });

      if (logoNew) {
        formData.append("logo_url", logoNew);
      } else if (logoExisting) {
        formData.append("keep_image_logo", "1");
      }

      if (faviconNew) {
        formData.append("favicon_url", faviconNew);
      } else if (faviconExisting) {
        formData.append("keep_image_favicon", "1");
      }

      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value}`);
      }
      formData.append("_method", "put");
      const response = await api.post("/admin/business_settings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status) {
        const updatedConfig = {
          ...response.data.data,
          auto_post: !!response.data.data.auto_post,
          auto_transaction: !!response.data.data.auto_transaction,
        };

        setConfig(updatedConfig);
        setEditConfig(updatedConfig);
        setLogoExisting(
          updatedConfig.logo_url ? { image_url: updatedConfig.logo_url } : null
        );
        setFaviconExisting(
          updatedConfig.favicon_url
            ? { image_url: updatedConfig.favicon_url }
            : null
        );
        setLogoNew(null);
        setFaviconNew(null);
        setIsEditing(false);
        pop(response.data.message || "Cập nhật thành công");
      } else {
        throw new Error(response.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating config:", error);
      pop("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === "auto_post" || field === "auto_transaction") {
      formattedValue = value; 
    } else if (field === "auto_post_interval") {
      formattedValue = parseInt(value) || 60;
    }
    setEditConfig((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleFileSelect = (field, file) => {
    if (!file) return;
    const withPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });
    if (field === "logo_url") {
      setLogoNew(withPreview);
      setLogoExisting(null);
      setEditConfig((prev) => ({ ...prev, logo_url: "" }));
    } else if (field === "favicon_url") {
      setFaviconNew(withPreview);
      setFaviconExisting(null);
      setEditConfig((prev) => ({ ...prev, favicon_url: "" }));
    }
  };

  const handleRemoveImage = (field) => {
    if (field === "logo_url") {
      if (logoNew) URL.revokeObjectURL(logoNew.preview);
      setLogoNew(null);
      setLogoExisting(null);
      setEditConfig((prev) => ({ ...prev, logo_url: "" }));
    } else if (field === "favicon_url") {
      if (faviconNew) URL.revokeObjectURL(faviconNew.preview);
      setFaviconNew(null);
      setFaviconExisting(null);
      setEditConfig((prev) => ({ ...prev, favicon_url: "" }));
    }
  };

  const templates = [
    { value: 'default', label: 'Mặc định' },
    { value: 'modern', label: 'Hiện đại' },
    { value: 'classic', label: 'Cổ điển' },
    { value: 'minimal', label: 'Tối giản' }
  ];

  const labelClass =
    "block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300";
  const inputClass =
    "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  if (loading) return <LoadingDomain />;

  // JSX return statement remains unchanged
  return (
    <div className="font-sans bg-slate-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex">
        <div className="flex-1">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Cấu hình Website
                </h1>
                <p className="mt-1 text-md text-gray-600 dark:text-gray-400">
                  Quản lý thông tin cơ bản của website
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Tên cửa hàng *</label>
                    <input
                      type="text"
                      value={
                        isEditing ? editConfig.shop_name : config.shop_name
                      }
                      onChange={(e) =>
                        handleInputChange("shop_name", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="Ví dụ: Cửa hàng ABC"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Slogan</label>
                    <input
                      type="text"
                      value={isEditing ? editConfig.slogan : config.slogan}
                      onChange={(e) =>
                        handleInputChange("slogan", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="Ví dụ: Chất lượng hàng đầu"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Phone className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={
                        isEditing
                          ? editConfig.phone_number
                          : config.phone_number
                      }
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="Ví dụ: 0123 456 789"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Mail className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={isEditing ? editConfig.email : config.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="Ví dụ: contact@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <MapPin className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editConfig.address : config.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <MessageCircle className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                      Link Zalo
                    </label>
                    <input
                      type="url"
                      value={
                        isEditing ? editConfig.zalo_link : config.zalo_link
                      }
                      onChange={(e) =>
                        handleInputChange("zalo_link", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="https://zalo.me/..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Facebook className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                      Link Facebook
                    </label>
                    <input
                      type="url"
                      value={
                        isEditing
                          ? editConfig.facebook_link
                          : config.facebook_link
                      }
                      onChange={(e) =>
                        handleInputChange("facebook_link", e.target.value)
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Template *</label>
                    <select
                      value={
                        isEditing
                          ? editConfig.template_name
                          : config.template_name
                      }
                      onChange={(e) =>
                        handleInputChange("template_name", e.target.value)
                      }
                      disabled={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                    >
                      {templates.map((template) => (
                        <option key={template.value} value={template.value}>
                          {template.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Khoảng thời gian tự động đăng (phút)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={
                        isEditing
                          ? editConfig.auto_post_interval
                          : config.auto_post_interval
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "auto_post_interval",
                          parseInt(e.target.value)
                        )
                      }
                      readOnly={!isEditing}
                      className={`${inputClass} ${
                        !isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : ""
                      }`}
                      placeholder="Ví dụ: 60"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto_post"
                        checked={
                          isEditing ? editConfig.auto_post : config.auto_post
                        }
                        onChange={(e) =>
                          handleInputChange("auto_post", e.target.checked)
                        }
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="auto_post"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                      >
                        Tự động đăng bài
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto_transaction"
                        checked={
                          isEditing
                            ? editConfig.auto_transaction
                            : config.auto_transaction
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "auto_transaction",
                            e.target.checked
                          )
                        }
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor="auto_transaction"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                      >
                        Tự động xử lý giao dịch
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Hình ảnh
                </h3>

                <div className="mb-6">
                  <label className={labelClass}>Logo</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    ref={logoInputRef}
                    onChange={(e) =>
                      handleFileSelect("logo_url", e.target.files[0])
                    }
                    disabled={!isEditing}
                    className="hidden"
                  />
                  {logoExisting || logoNew ? (
                    <div className="relative group w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={logoNew ? logoNew.preview : logoExisting.image_url}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current.click()}
                            className="text-white text-sm bg-gray-800 bg-opacity-70 py-1 px-3 rounded-md mr-2"
                          >
                            Thay đổi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage("logo_url")}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => isEditing && logoInputRef.current.click()}
                      className={`flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        !isEditing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <ImagePlus
                        size={40}
                        className="text-gray-400 dark:text-gray-500 mb-2"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          Nhấn để tải logo lên
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        PNG, JPG hoặc SVG
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Favicon</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/x-icon"
                    ref={faviconInputRef}
                    onChange={(e) =>
                      handleFileSelect("favicon_url", e.target.files[0])
                    }
                    disabled={!isEditing}
                    className="hidden"
                  />
                  {faviconExisting || faviconNew ? (
                    <div className="relative group w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={
                          faviconNew
                            ? faviconNew.preview
                            : faviconExisting.image_url
                        }
                        alt="Favicon Preview"
                        className="w-full h-full object-contain"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => faviconInputRef.current.click()}
                            className="text-white text-sm bg-gray-800 bg-opacity-70 py-1 px-3 rounded-md mr-2"
                          >
                            Thay đổi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage("favicon_url")}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        isEditing && faviconInputRef.current.click()
                      }
                      className={`flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        !isEditing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <ImagePlus
                        size={40}
                        className="text-gray-400 dark:text-gray-500 mb-2"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          Nhấn để tải favicon lên
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        PNG, JPG, SVG hoặc ICO
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingPage;
