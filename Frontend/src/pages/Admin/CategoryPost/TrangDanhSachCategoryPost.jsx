// @pages/Admin/Posts/TrangDanhSachBaiViet.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@components/Admin/Layout/Layout.jsx";
import PostsListPage from "./ListCategoryPostPage";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import api from "../../../utils/http";
import { useNotification } from "../../../contexts/NotificationContext";
import ListCategoryPostPage from "./ListCategoryPostPage";


// Các key dùng để tìm kiếm cục bộ
const LOCAL_SEARCHABLE_KEYS = ["name", "description"];;

const TrangDanhSachCategoryPost = () => {
  const { pop, conFim } = useNotification();
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTermLocal, setSearchTermLocal] = useState("");

  const navigate = useNavigate();
  const location = useLocation();


  

  // Gọi API để lấy danh sách bài viết
  const getCategoryPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const response = await api.get("/admin/categoryPost", { params });
      const categoryPostsData = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log("Response từ API:", response); // Debug toàn bộ response
      
      const meta = response.data?.data ? { ...response.data.data } : {};
      delete meta.data; // Loại bỏ trường data khỏi meta
      setCategoryPosts(categoryPostsData);
      setPaginationMeta(meta);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      }); // Debug chi tiết
      pop("Lấy danh sách danh mục bài viết thất bại", "e");
      setCategoryPosts([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }, [location.search, pop]);

  // Gọi API khi component mount hoặc URL thay đổi
  useEffect(() => {
    getCategoryPosts();
  }, [getCategoryPosts]);

  // Hàm áp dụng bộ lọc
  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    for (const key in newFilters) {
      if (newFilters[key]) params.set(key, newFilters[key]);
    }
    navigate({ search: params.toString() });
  };
  

  // Hàm reset bộ lọc
  const handleResetFilters = () => {
    navigate({ search: "" });
    setSearchTermLocal("");
  };

  // Hàm xử lý tìm kiếm cục bộ
 const displayedCategoryPosts = useMemo(() => {
  const posts = Array.isArray(categoryPosts) ? categoryPosts : [];

  if (!searchTermLocal) return posts;

  const lowercasedTerm = searchTermLocal.toLowerCase();
  return posts.filter((item) =>
    LOCAL_SEARCHABLE_KEYS.some((key) =>
      item[key]?.toString().toLowerCase().includes(lowercasedTerm)
    )
  );
}, [categoryPosts, searchTermLocal]);


  // Các hàm hành động
  const handleAddCategoryPost = () => navigate("/admin/categoryPost/new");

  if (loading) return <LoadingDomain />;

  return (
    <Layout
      title="Danh sách danh mục bài viết"
      showBackButton={false} 
      showfilter={false}
      showAddButton={true}
      onAdd={handleAddCategoryPost}
      onLocalSearch={setSearchTermLocal}
      initialSearchTermLocal={searchTermLocal}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      paginationMeta={paginationMeta}
    >
      <ListCategoryPostPage
        categories={displayedCategoryPosts  || []}
        onRefresh={getCategoryPosts}
      />
    </Layout>
  );
};

export default TrangDanhSachCategoryPost;