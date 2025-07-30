import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../utils/http";
import { useNotification } from "../../../contexts/NotificationContext";
import { ArrowLeft } from "lucide-react";

const EditCategoryPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pop } = useNotification();

  const [categoryPost, setCategoryPost] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [loading, setLoading] = useState(true); // Bắt đầu với loading=true để hiển thị skeleton/spinner
  const [errors, setErrors] = useState({});

  // Hàm tạo slug không thay đổi
  const removeVietnameseAccents = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  // Tự động tạo slug khi đổi name
  useEffect(() => {
    // Chỉ chạy khi đã có dữ liệu ban đầu
    if (!loading) {
      const newSlug = removeVietnameseAccents(categoryPost.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setCategoryPost((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [categoryPost.name, loading]);

  // Gọi API để lấy dữ liệu danh mục cần edit
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/categoryPost/${id}`);
        if (res.data?.data) {
          setCategoryPost(res.data.data);
        } else {
          pop("Không tìm thấy danh mục", "e");
          navigate("/admin/categoryPost");
        }
      } catch (err) {
        console.error("Lỗi load chi tiết danh mục:", err);
        pop("Lỗi khi tải thông tin danh mục", "e");
        navigate("/admin/categoryPost");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, pop, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!categoryPost.name.trim()) {
      newErrors.name = "Tên category không được để trống.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryPost((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      // API của bạn dùng POST cho cả update, tôi giữ nguyên
      const response = await api.post(
        `/admin/categoryPost/${id}`,
        categoryPost
      );
      if (response.status === 200) {
        pop("Cập nhật danh mục thành công!", "s");
        navigate("/admin/categoryPost");
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors(serverErrors);
      } else {
        setErrors({
          form:
            err.response?.data?.message ||
            "Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại!",
        });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Giao diện khi đang tải dữ liệu
  if (loading && !categoryPost.name) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-6"></div>
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 mb-4"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <form onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Chỉnh sửa danh mục
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cập nhật thông tin cho danh mục:{" "}
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {categoryPost.name}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/categoryPost"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Card Thông tin chính */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
              Thông tin bắt buộc
            </h3>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tên Category
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={categoryPost.name}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                    errors.name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600"
                  }`}
                  placeholder="VD: Tin tức công nghệ"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          {/* Card Mô tả */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Mô tả (Không bắt buộc)
            </h3>
            <div className="mt-4">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={categoryPost.description}
                onChange={handleChange}
                className="block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
                placeholder="Nhập mô tả ngắn gọn về danh mục này..."
              />
            </div>
          </div>

          {errors.form && (
            <p className="text-red-500 text-sm text-center py-2 px-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              {errors.form}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditCategoryPostPage;
