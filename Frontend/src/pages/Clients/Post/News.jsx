import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import api from "../../../utils/http";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

export default function News() {
  // === LOGIC KHÔNG THAY ĐỔI ===
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await api.get("/categoryPost");
        setCategories(categoriesResponse.data?.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const currentCategory = categorySlug || "all";
    setCurrentPage(1);
  }, [categorySlug]);

  useEffect(() => {
    const currentCategory = categorySlug || "all";
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      let endpoint =
        currentCategory === "all"
          ? `/post?page=${currentPage}`
          : `/post/getcategory/${currentCategory}?page=${currentPage}`;

      try {
        const response = await api.get(endpoint);
        const responseData = response.data?.data;
        setPosts(responseData?.data || []);
        setPagination({
          current_page: responseData.current_page,
          last_page: responseData.last_page,
        });
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải bài viết.");
        console.error("Lỗi chi tiết:", err.response?.data || err.message);
        setPosts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [categorySlug, currentPage]);

  const handleCategoryChange = useCallback(
    (slug) => {
      if (slug === "all") {
        navigate("/tin-tuc");
      } else {
        navigate(`/tin-tuc/${slug}`);
      }
    },
    [navigate]
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination?.last_page) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const categoryIdToSlugMap = categories.reduce((map, cat) => {
    map[cat.id] = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
    return map;
  }, {});

  const activeCategory = categorySlug || "all";
  // === KẾT THÚC LOGIC ===

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Danh mục */}
        <aside className="lg:w-64 lg:flex-shrink-0">
          <div className="bg-input rounded-xl p-6 sticky top-8 shadow-themed">
            <h3 className="font-heading text-lg font-bold text-primary mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-accent" />
              Danh mục
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeCategory === "all"
                    ? "bg-accent text-accent-contrast shadow-md"
                    : "text-secondary hover:bg-tertiary hover:text-primary"
                }`}
              >
                Tất cả bài viết
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeCategory === category.slug
                      ? "bg-accent text-accent-contrast shadow-md"
                      : "text-secondary hover:bg-tertiary hover:text-primary"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Danh sách bài viết */}
        <div className="flex-1 min-w-0">
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div className="text-center py-10 text-secondary">
              <LoadingDomain />
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {posts.map((article) => {
                  const catSlug =
                    categoryIdToSlugMap[article.category_id] || "uncategorized";
                  return (
                    <Link
                      key={article.id}
                      to={`/tin-tuc/${catSlug}/${article.slug}`}
                      className="bg-input rounded-xl overflow-hidden block group category-card-glow"
                    >
                      <div className="relative">
                        <img
                          src={
                            article.image_thumbnail_url || "/placeholder.svg"
                          }
                          alt={article.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading text-lg font-bold text-primary mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-accent">
                          {article.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-secondary mt-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1.5" />
                            {article.author?.username || "Không rõ"}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1.5" />
                            {new Date(article.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Phân trang */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-secondary bg-input border-themed rounded-lg transition-colors hover:border-hover hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-primary bg-input rounded-lg border-themed">
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-secondary bg-input border-themed rounded-lg transition-colors hover:border-hover hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-secondary">
              Không có bài viết nào để hiển thị.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
