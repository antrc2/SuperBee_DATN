import { useState, useEffect } from "react";
import { Calendar, Eye, User, ChevronLeft, ChevronRight, Clock, Filter } from "lucide-react";
import api from "../../../utils/http";
import { useNavigate, Link } from "react-router-dom"; // Import Link

export default function News() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  const [newsArticles, setNewsArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Call API to get posts
        const newsResponse = await api.get('/post');
        const rawData = newsResponse.data?.data;
        const articlesData = Array.isArray(rawData) ? rawData : (rawData && Array.isArray(rawData.data) ? rawData.data : []);
        setNewsArticles(articlesData);

        // Call API to get categories
        const categoriesResponse = await api.get('/categoryPost');
        const categoriesData = Array.isArray(categoriesResponse.data?.data) ? categoriesResponse.data.data : [];
        if (!categoriesData.length) {
          throw new Error('Dữ liệu danh mục trống hoặc không hợp lệ');
        }
        setCategories(categoriesData);
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!');
        console.error('Lỗi chi tiết:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter articles by category
  const filteredArticles = selectedCategory === "all"
    ? newsArticles
    : newsArticles.filter((article) => article.category_id === selectedCategory || (selectedCategory === null && article.category_id === null));

  // Pagination logic for main articles
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  // Latest news (top 5 most recent, no pagination for this section)
  const latestNews = newsArticles
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Categories to display (either latest 10 or all)
  const categoriesToDisplay = showAllCategories
    ? categories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    : categories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to page 1 when changing category
  };

  const handleToggleCategories = () => {
    setShowAllCategories(!showAllCategories);
  };

  // Removed handleArticleClick since we're using Link directly now

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Categories */}
        <aside className="lg:w-64">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Danh mục bài viết
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Tất cả ({newsArticles.length})
              </button>
              {categoriesToDisplay.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {newsArticles.some(a => a.category_id === null) && (
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Chưa phân loại ({newsArticles.filter(a => a.category_id === null).length})
                </button>
              )}
              {categories.length > 10 && (
                <button
                  onClick={handleToggleCategories}
                  className="w-full text-center px-4 py-2 mt-4 border border-gray-300 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {showAllCategories ? "Thu gọn" : `Xem thêm (${categories.length - categoriesToDisplay.length})`}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* News Grid - 2 columns, 3 rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentArticles.length > 0 ? (
              currentArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`} // Use 'to' prop for navigation
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer block" // Added 'block' to make Link act like article
                >
                  <div className="relative">
                    <img
                      src={article.image_thumbnail_url || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {article.description ? `${article.description.substring(0, 50)}${article.description.length > 50 ? '...' : ''}` : ''}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {article.author?.username || 'Không rõ'}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(article.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">Không có bài viết để hiển thị.</div>
            )}
          </div>

          {/* Pagination for main articles */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Latest News */}
        <aside className="lg:w-80">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Tin tức mới nhất
            </h3>
            <div className="space-y-4">
              {latestNews.length > 0 ? (
                latestNews.map((article) => (
                  <Link // Use Link here as well
                    key={article.id}
                    to={`/news/${article.slug}`}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors items-start"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={article.image_thumbnail_url || "/placeholder.svg"}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{article.title}</h4>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(article.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-5 text-gray-500">Không có tin tức mới nhất.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}