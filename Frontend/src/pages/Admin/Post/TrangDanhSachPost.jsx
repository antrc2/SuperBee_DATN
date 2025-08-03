// @pages/Admin/Posts/TrangDanhSachBaiViet.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Sửa lại đường dẫn nếu cần thiết, giả sử cấu trúc là components/Admin/Layout/Layout.jsx
import Layout from "../../../components/Admin/Layout/Layout.jsx";
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
  const [isAutoPostEnabled, setIsAutoPostEnabled] = useState(false);

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
    // Thêm các filter khác nếu có từ URL
    params.forEach((value, key) => {
      if (!currentFilters.hasOwnProperty(key)) {
        currentFilters[key] = value;
      }
    });
    return currentFilters;
  }, [location.search]);

  const getPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const response = await api.get("/admin/post", { params });

      const postsData = Array.isArray(response.data?.data?.data)
        ? response.data.data.data
        : [];
      const meta = response.data?.data ? { ...response.data.data } : {};
      delete meta.data;

      setPosts(postsData);
      setPaginationMeta(meta);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      pop("Lấy danh sách bài viết thất bại", "e");
      setPosts([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }, [location.search, pop]);

  const fetchAutoPostStatus = useCallback(async () => {
    try {
      const response = await api.get("/admin/post/business");
      const setting = response.data?.data;
      setIsAutoPostEnabled(setting?.auto_post === 1);
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái auto_post:", error);
    }
  }, []);

  useEffect(() => {
    getPosts();
    fetchAutoPostStatus();
  }, [getPosts, fetchAutoPostStatus]);

  const handleApplyFilters = (newFilters) => {
    const currentParams = new URLSearchParams(location.search);
    const page = currentParams.get("page");

    const params = new URLSearchParams();
    if (page) {
      params.set("page", page);
    }

    for (const key in newFilters) {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      }
    }
    navigate({ search: params.toString() });
  };

  const handleResetFilters = () => {
    navigate({ search: "" });
    setSearchTermLocal("");
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
  };

  const displayedPosts = useMemo(() => {
    if (!searchTermLocal) return posts || [];

    const lowercasedTerm = searchTermLocal.toLowerCase();
    return posts.filter((post) =>
      LOCAL_SEARCHABLE_KEYS.some((key) =>
        post[key]?.toString().toLowerCase().includes(lowercasedTerm)
      )
    );
  }, [posts, searchTermLocal]);

  const handleAddPost = () => navigate("/admin/post/new");

  const handleAction = async (actionType, id, confirmMessage) => {
    const ok = await conFim(confirmMessage);
    if (ok) {
      try {
        const url = `/admin/post/${id}/${actionType}`;
        await api.patch(url);
        getPosts();
        pop(
          `${actionType === "publish" ? "Xuất bản" : "Lưu trữ"} thành công`,
          "s"
        );
      } catch (err) {
        pop(
          `Lỗi khi ${
            actionType === "publish" ? "xuất bản" : "lưu trữ"
          } bài viết`,
          "e"
        );
        console.error(`Lỗi khi thực hiện hành động ${actionType}:`, err);
      }
    }
  };

  const toggleAutoPost = async () => {
    const action = isAutoPostEnabled ? "hủy" : "bật";
    const endpoint = isAutoPostEnabled
      ? "/admin/post/RefreshAuto"
      : "/admin/post/auto";

    const ok = await conFim(`Bạn có chắc muốn ${action} tự động đăng bài?`);
    if (ok) {
      try {
        await api.post(endpoint);
        pop(`Đã ${action} tự động đăng bài thành công.`, "s");
        fetchAutoPostStatus(); // Cập nhật lại trạng thái nút
      } catch (error) {
        pop(`Lỗi khi ${action} tự động đăng bài.`, "e");
        console.error(`Lỗi khi ${action} tự động đăng bài:`, error);
      }
    }
  };

  if (loading) return <LoadingDomain />;

  return (
    <Layout
      title="Danh sách bài viết"
      showBackButton={false}
      showAddButton={true}
      showAuToPost={true}
      autoPostButtonLabel={
        isAutoPostEnabled ? "Hủy tự động đăng" : "Bật tự động đăng"
      }
      onshow={toggleAutoPost}
      onAdd={handleAddPost}
      onLocalSearch={setSearchTermLocal}
      initialSearchTermLocal={searchTermLocal}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      initialFilters={filters}
      filterConfig={POST_FILTERS_CONFIG}
      activeFilterCount={
        Object.keys(filters).filter((k) => k !== "page").length
      }
      paginationMeta={paginationMeta}
      onPageChange={handlePageChange}
    >
      <PostsListPage
        posts={displayedPosts}
        handleKey={(id) =>
          handleAction("publish", id, "Bạn có chắc muốn xuất bản bài viết này?")
        }
        handleLock={(id) =>
          handleAction(
            "unpublish",
            id,
            "Bạn có chắc muốn lưu trữ bài viết này?"
          )
        }
      />
    </Layout>
  );
};

export default TrangDanhSachBaiViet;
