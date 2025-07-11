import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/http';
import { useNotification } from '../../../contexts/NotificationContext';

const EditCategoryPost = () => {
  const { id } = useParams(); // 🧭 Lấy slug từ URL
  const navigate = useNavigate();
  const { pop } = useNotification();

  const [categoryPost, setCategoryPost] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeVietnameseAccents = (str) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

  // 🧩 Tự động tạo slug khi đổi name
  useEffect(() => {
    const newSlug = removeVietnameseAccents(categoryPost.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setCategoryPost((prev) => ({ ...prev, slug: newSlug }));
  }, [categoryPost.name]);

  // 📥 Gọi API để lấy dữ liệu danh mục cần edit
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/admin/categoryPost/${id}`);
        if (res.data?.data) {
          setCategoryPost(res.data.data);
        } else {
          pop('Không tìm thấy danh mục', 'e');
          navigate('/admin/categoryPost');
        }
      } catch (err) {
        console.error('Lỗi load chi tiết danh mục:', err);
        pop('Lỗi khi tải thông tin danh mục', 'e');
        navigate('/admin/categoryPost');
      }
    };
    fetchCategory();
  }, [id, pop, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryPost((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/admin/categoryPost/${id}`, categoryPost);
      if (response.status === 200) {
        pop('Cập nhật danh mục thành công!', 's');
        navigate('/admin/categoryPost');
      } else {
        setError('Cập nhật thất bại!');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Chỉnh sửa Category Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên Category</label>
          <input
            type="text"
            name="name"
            value={categoryPost.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            placeholder="Nhập tên category"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
          <input
            type="text"
            name="slug"
            value={categoryPost.slug}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <textarea
            name="description"
            value={categoryPost.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-y"
            placeholder="Nhập mô tả"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </form>
    </div>
  );
};

export default EditCategoryPost;
