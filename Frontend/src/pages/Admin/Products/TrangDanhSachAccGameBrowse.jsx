// TrangDanhSachAccGame.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@components/Admin/Layout/Layout.jsx";
import ProductsListPage from "./ProductsListPage";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import api from "../../../utils/http";
import { PRODUCT_FILTERS_CONFIG } from "./filterConfigs";
import { useNotification } from "../../../contexts/NotificationContext";
import ProductsBrowse from "./ProductsBrowse";
// Các key dùng để tìm kiếm ở FE (trên dữ liệu đã tải về của trang hiện tại)
const LOCAL_SEARCHABLE_KEYS = ["sku"];

const TrangDanhSachAccGameBrowse = () => {
  const { pop, conFim } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [searchTermLocal, setSearchTermLocal] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ----- PHÂN TÍCH VÀ QUẢN LÝ BỘ LỌC TỪ URL -----
  // `filters` là state đại diện cho các bộ lọc hiện tại, được đồng bộ từ URL.
  // `useMemo` được dùng để tính toán giá trị này chỉ khi `location.search` thay đổi.
  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const currentFilters = {};
    // Duyệt qua config để lấy các giá trị hợp lệ từ URL và đưa vào object `currentFilters`
    PRODUCT_FILTERS_CONFIG.forEach((config) => {
      if (config.type === "number_range") {
        if (params.has(config.minName))
          currentFilters[config.minName] = params.get(config.minName);
        if (params.has(config.maxName))
          currentFilters[config.maxName] = params.get(config.maxName);
      } else {
        if (params.has(config.name))
          currentFilters[config.name] = params.get(config.name);
      }
    });
    return currentFilters;
  }, [location.search]);

  // ----- GỌI API ĐỂ LẤY DỮ LIỆU -----
  // `useCallback` để tránh tạo lại hàm `getProducts` mỗi lần render, chỉ tạo lại khi dependency thay đổi.
  const getProducts = useCallback(async () => {
    setLoading(true);
    // Lấy các tham số từ URL hiện tại
    const params = new URLSearchParams(location.search);
    try {
      const response = await api.get("/admin/products/browse", { params });
      const { data, ...meta } = response.data.data;
      setProducts(data);
      setPaginationMeta(meta);
      pop("lấy dữ liệu thành công", "s");
    } catch (error) {
      pop("lấy dữ liệu thất bại", "e");
      console.error("Lỗi khi tải dữ liệu:", error);
      setProducts([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }, [location.search]); // Phụ thuộc vào `location.search` -> Tự động gọi lại khi URL thay đổi.

  // `useEffect` chính để gọi API. Nó sẽ chạy khi component mount và mỗi khi `getProducts` thay đổi (tức là khi URL thay đổi).
  useEffect(() => {
    getProducts();
  }, [getProducts]);

  // ----- CÁC HÀM XỬ LÝ SỰ KIỆN -----

  // Hàm áp dụng bộ lọc mới. Nó sẽ cập nhật lại URL.
  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    // Thêm các filter mới vào params
    for (const key in newFilters) {
      params.set(key, newFilters[key]);
    }
    // Reset về trang 1 khi áp dụng bộ lọc mới
    params.set("page", "1");
    // Dùng `Maps` để cập nhật URL, việc này sẽ kích hoạt `useEffect` ở trên để gọi lại API.
    navigate({ search: params.toString() });
  };

  // Hàm reset bộ lọc. Chỉ đơn giản là điều hướng về trang không có query params.
  const handleResetFilters = () => {
    navigate({ search: "" });
  };

  // Hàm chuyển trang.
  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
    setSearchTermLocal(""); // Reset tìm kiếm FE khi chuyển trang
  };

  // Hàm xử lý tìm kiếm ở FE.
  const displayedProducts = useMemo(() => {
    if (!searchTermLocal) {
      return products;
    }
    const lowercasedTerm = searchTermLocal.toLowerCase();
    return products.filter((item) =>
      LOCAL_SEARCHABLE_KEYS.some((key) =>
        item[key]?.toString().toLowerCase().includes(lowercasedTerm)
      )
    );
  }, [products, searchTermLocal]);

  // Các hàm hành động khác
  // const handleAddAccount = () => navigate("/admin/products/new");
  // const handleApprove = () => navigate("/admin/products/browse");
  const handleAction = async (actionType, id, confirmMessage) => {
    const ok = await conFim(confirmMessage);
    console.log("🚀 ~ handleAction ~ ok:", ok);
    if (ok) {
      try {
        const url = `/admin/products/${id}/${actionType}`;
        await api.post(url);
        getProducts(); // Tải lại dữ liệu sau khi thực hiện hành động
      } catch (err) {
        console.error(`Lỗi khi thực hiện hành động ${actionType}:`, err);
      }
    }
  };

  if (loading) return <LoadingDomain />;

  return (
    <Layout
      title="Danh sách tài khoản game chờ duyệt"
      showBackButton={false}
      showBrowse={false}
      showAddButton={true}
      // onAdd={handleAddAccount}
      // onApprove={handleApprove}
      onLocalSearch={setSearchTermLocal}
      initialSearchTermLocal={searchTermLocal}
      paginationMeta={paginationMeta}
      onPageChange={handlePageChange}
      // Props cho Filter
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      initialFilters={filters}
      filterConfig={PRODUCT_FILTERS_CONFIG}
      activeFilterCount={Object.keys(filters).length} // Đếm số bộ lọc đang active
    >
      <ProductsBrowse
        products={displayedProducts}
        handleKey={(id) =>
          handleAction("restore", id, "Kích hoạt lại sản phẩm này?")
        }
        handleLock={(id) => handleAction("cancel", id, "Khóa sản phẩm này?")}
      />
    </Layout>
  );
};

export default TrangDanhSachAccGameBrowse;
