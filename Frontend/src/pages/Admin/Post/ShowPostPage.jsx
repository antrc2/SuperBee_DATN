import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../utils/http";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ArrowLeft, Edit } from "lucide-react"; // Icons cho các nút hành động

export default function ShowPostPage() {
  // Thay đổi: Sử dụng id thay vì id để URL thân thiện hơn
  const { id } = useParams();
  console.log("🚀 ~ ShowPostPage ~ id:", id);
  const navigate = useNavigate();

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy id bài viết trong URL.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        // Thay đổi: Gọi API bằng id
        const response = await api.get(`/admin/post/${id}`);
        setPostData(response.data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Bài viết không tồn tại.");
        } else {
          setError("Lỗi khi tải bài viết. Vui lòng thử lại.");
        }
        setPostData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Các Component con để giao diện sạch sẽ hơn
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Đang tải bài viết...</p>
    </div>
  );

  const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900 p-6 text-center">
      <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
        Đã xảy ra lỗi
      </p>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{message}</p>
      <button
        onClick={() => navigate("/admin/post")}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!postData)
    return <ErrorDisplay message="Không có dữ liệu bài viết để hiển thị." />;

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans transition-colors">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Thanh điều hướng nhỏ ở trên cùng */}
        <nav className="mb-8 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <button
            onClick={() => navigate(`/admin/post/${postData.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-all"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
        </nav>

        <article>
          {/* Header của bài viết */}
          <header className="mb-8 text-center">
            {postData.category && (
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                {postData.category.name}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight break-words">
              {postData.title}
            </h1>
            <div className="mt-6 flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {postData.author && (
                <div className="flex items-center gap-3">
                  <img
                    src={postData.author.avatar_url || "/placeholder.svg"}
                    alt={postData.author.username || "Tác giả"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {postData.author.username}
                  </span>
                </div>
              )}
              <span className="hidden sm:inline">•</span>
              <time dateTime={postData.created_at}>
                {formatDate(postData.created_at)}
              </time>
            </div>
          </header>

          {/* Ảnh bìa */}
          {postData.image_thumbnail_url && (
            <figure className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src={postData.image_thumbnail_url}
                alt={postData.title}
                className="w-full h-auto object-cover"
              />
            </figure>
          )}

          {/* Nội dung bài viết với định dạng từ Tailwind Typography */}
          <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none prose-img:rounded-lg prose-img:shadow-md prose-video:rounded-lg prose-video:shadow-md prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {postData.content || "Không có nội dung"}
            </ReactMarkdown>
          </div>

          <hr className="my-12 border-gray-200 dark:border-gray-700" />

          {/* Thông tin thêm ở cuối bài */}
          <footer className="space-y-10">
            {/* Thông tin danh mục */}
            {postData.category && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">
                  Về danh mục: {postData.category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {postData.category.description ||
                    "Không có mô tả cho danh mục này."}
                </p>
              </div>
            )}

            {/* Thông tin tác giả */}
            {postData.author && (
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <img
                  src={postData.author.avatar_url || "/placeholder.svg"}
                  alt={postData.author.username}
                  className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800"
                />
                <div className="text-center sm:text-left">
                  <p className="text-xs uppercase text-gray-500">Viết bởi</p>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {postData.author.username}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {postData.author.email}
                  </p>
                </div>
              </div>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
}
