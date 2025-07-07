// @pages/Admin/Posts/TrangDanhSachBaiViet.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@components/Admin/Layout/Layout.jsx";
import PostsListPage from "./ListPostPage";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import api from "../../../utils/http";
import { useNotification } from "../../../contexts/NotificationContext";

// Cấu hình bộ lọc trạng thái
const POST_FILTERS_CONFIG = [
  {
    name: "status",
    type: "select",
    label: "Trạng thái",
    options: [
      { value: "", label: "Tất cả" },
      { value: "0", label: "Nháp" },
      { value: "1", label: "Đã xuất bản" },
      { value: "2", label: "Lưu trữ" },
    ],
  },
];

// Các key dùng để tìm kiếm cục bộ
const LOCAL_SEARCHABLE_KEYS = ["title"];

const TrangDanhSachBaiViet = () => {
  const { pop, conFim } = useNotification();
  const [posts, setPosts] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTermLocal, setSearchTermLocal] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Phân tích bộ lọc từ URL
  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const currentFilters = {};
    POST_FILTERS_CONFIG.forEach((config) => {
      if (params.has(config.name)) {
        currentFilters[config.name] = params.get(config.name);
      }
    });
    return currentFilters;
  }, [location.search]);

  // Gọi API để lấy danh sách bài viết
  const getPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      console.log("Đang gọi API với params:", params.toString()); // Debug
      const response = await api.get("/admin/post", { params });
      console.log("Response từ API:", response); // Debug toàn bộ response
      const postsData = Array.isArray(response.data?.data?.data) ? response.data.data.data : [];
      const meta = response.data?.data ? { ...response.data.data } : {};
      delete meta.data; // Loại bỏ trường data khỏi meta
      setPosts(postsData);
      setPaginationMeta(meta);
      console.log("Posts state:", postsData); // Debug
      pop("Lấy danh sách bài viết thành công", "s");
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      }); // Debug chi tiết
      pop("Lấy danh sách bài viết thất bại", "e");
      setPosts([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }, [location.search, pop]);

  // Gọi API khi component mount hoặc URL thay đổi
  useEffect(() => {
    console.log("useEffect chạy, gọi getPosts"); // Debug
    getPosts();
  }, [getPosts]);

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
  const displayedPosts = useMemo(() => {
    console.log("Tính toán displayedPosts, posts:", posts, "searchTermLocal:", searchTermLocal, "filters:", filters); // Debug
    if (!searchTermLocal && !filters.status) return posts || [];
    let filteredPosts = Array.isArray(posts) ? posts : [];
    if (filters.status) {
      filteredPosts = filteredPosts.filter((post) => post.status.toString() === filters.status);
    }
    if (searchTermLocal) {
      const lowercasedTerm = searchTermLocal.toLowerCase();
      filteredPosts = filteredPosts.filter((post) =>
        LOCAL_SEARCHABLE_KEYS.some((key) =>
          post[key]?.toString().toLowerCase().includes(lowercasedTerm)
        )
      );
    }
    console.log("displayedPosts:", filteredPosts); // Debug
    return filteredPosts;
  }, [posts, searchTermLocal, filters]);

  // Các hàm hành động
  const handleAddPost = () => navigate("/admin/post/new");
  const handleAction = async (actionType, id, confirmMessage) => {
    const ok = await conFim(confirmMessage);
    if (ok) {
      try {
        const url = `/admin/post/${id}/${actionType}`;
        await api.patch(url);
        getPosts();
        pop(`${actionType === "publish" ? "Xuất bản" : "Hủy xuất bản"} thành công`, "s");
      } catch (err) {
        pop(`Lỗi khi ${actionType === "publish" ? "xuất bản" : "hủy xuất bản"} bài viết`, "e");
        console.error(`Lỗi khi thực hiện hành động ${actionType}:`, err);
      }
    }
  };

  if (loading) return <LoadingDomain />;

  return (
    <Layout
      title="Danh sách bài viết"
      showBackButton={false}
      showAddButton={true}
      onAdd={handleAddPost}
      onLocalSearch={setSearchTermLocal}
      initialSearchTermLocal={searchTermLocal}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      initialFilters={filters}
      filterConfig={POST_FILTERS_CONFIG}
      activeFilterCount={Object.keys(filters).length}
      paginationMeta={paginationMeta}
    >
      <PostsListPage
        posts={displayedPosts || []}
        handleKey={(id) =>
          handleAction("publish", id, "Xuất bản bài viết này?")
        }
        handleLock={(id) => handleAction("unpublish", id, "Hủy xuất bản bài viết này?")}
      />
    </Layout>
  );
};

export default TrangDanhSachBaiViet;