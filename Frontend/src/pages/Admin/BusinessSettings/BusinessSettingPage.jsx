// BusinessSettings/BusinessSettingPage newest
import React, { useState, useEffect } from 'react';
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
    header_settings: '',
    footer_settings: '',
    auto_post: false,
    auto_transaction: false,
    auto_post_interval: 60
  });

  const [editConfig, setEditConfig] = useState(config);

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
 
          setConfig(configData);
          setEditConfig(configData);
        } else {
          console.error('API returned error:', response.data.message);
          // You can show a toast notification here instead of alert
          pop(response.data.message || 'Không thể tải dữ liệu cấu hình');
        }
      } catch (error) {
        console.error('Error fetching config:', error);
        pop('Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditConfig({...config});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditConfig(config);
  };
console.log(editConfig);
  const handleSave = async () => {
    setLoading(true);
 
    try {
      const response = await api.put(`/admin/business\_settings/${config.id}`, editConfig);
 
      if (response.data.status) {
        setConfig(editConfig);
        setIsEditing(false);
        // Show success message - you can replace with toast notification
        pop(response.message || 'Cập nhật thành công');
      } else {
        throw new Error(response.data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      pop('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const templates = [
    { value: 'default', label: 'Mặc định' },
    { value: 'modern', label: 'Hiện đại' },
    { value: 'classic', label: 'Cổ điển' },
    { value: 'minimal', label: 'Tối giản' }
  ];

  if (loading) return <LoadingDomain />;

return (
    <div className="font-sans bg-slate-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex">
        {/* Main Content */}
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
                  className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900 transition-colors"
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
                    className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shop Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Tên cửa hàng *
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editConfig.shop_name : config.shop_name}
                    onChange={(e) => handleInputChange('shop_name', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Slogan */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editConfig.slogan : config.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    URL Logo
                  </label>
                  <input
                    type="url"
                    value={isEditing ? editConfig.logo_url : config.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Favicon URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    URL Favicon
                  </label>
                  <input
                    type="url"
                    value={isEditing ? editConfig.favicon_url : config.favicon_url}
                    onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    <Phone className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? editConfig.phone_number : config.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    <Mail className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditing ? editConfig.email : config.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editConfig.address : config.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Zalo Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                    Link Zalo
                  </label>
                  <input
                    type="url"
                    value={isEditing ? editConfig.zalo_link : config.zalo_link}
                    onChange={(e) => handleInputChange('zalo_link', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Facebook Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    <Facebook className="w-4 h-4 inline mr-1 text-gray-600 dark:text-gray-400" />
                    Link Facebook
                  </label>
                  <input
                    type="url"
                    value={isEditing ? editConfig.facebook_link : config.facebook_link}
                    onChange={(e) => handleInputChange('facebook_link', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Template *
                  </label>
                  <select
                    value={isEditing ? editConfig.template_name : config.template_name}
                    onChange={(e) => handleInputChange('template_name', e.target.value)}
                    disabled={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  >
                    {templates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto Post Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Khoảng thời gian tự động đăng (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={isEditing ? editConfig.auto_post_interval : config.auto_post_interval}
                    onChange={(e) => handleInputChange('auto_post_interval', parseInt(e.target.value))}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Auto Settings */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto_post"
                      checked={isEditing ? editConfig.auto_post : config.auto_post}
                      onChange={(e) => handleInputChange('auto_post', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="auto\_post" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                      Tự động đăng bài
                    </label>
                  </div>
 
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto_transaction"
                      checked={isEditing ? editConfig.auto_transaction : config.auto_transaction}
                      onChange={(e) => handleInputChange('auto_transaction', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="auto\_transaction" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                      Tự động xử lý giao dịch
                    </label>
                  </div>
                </div>

                {/* Header Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Cài đặt Header (JSON)
                  </label>
                  <textarea
                    rows="3"
                    value={isEditing ? editConfig.header_settings : config.header_settings}
                    onChange={(e) => handleInputChange('header_settings', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
                </div>

                {/* Footer Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Cài đặt Footer (JSON)
                  </label>
                  <textarea
                    rows="3"
                    value={isEditing ? editConfig.footer_settings : config.footer_settings}
                    onChange={(e) => handleInputChange('footer_settings', e.target.value)}
                    readOnly={!isEditing}
                    className={`block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white ${
                      !isEditing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''
                    }`}
                  />
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