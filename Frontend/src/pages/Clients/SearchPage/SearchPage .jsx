// src/components/Client/Search/FilterSidebar.jsx

// src/components/Client/Search/FilterSidebar.jsx

import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
function renderCategoryOption(category, prefix = "") {
  if (category.children && category.children.length > 0) {
    // Nếu có con, render con (không cho chọn cha)
    return [
      <option key={category.id} value={category.id} disabled>
        {prefix + category.name}
      </option>,
      ...category.children.map((child) =>
        renderCategoryOption(child, prefix + "— ")
      ),
    ];
  }
  return (
    <option key={category.id} value={category.id}>
      {prefix + category.name}
    </option>
  );
}
function FilterSidebar({ categories, initialFilters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  // đồng bộ lại khi load initialFilters từ URL
  useEffect(() => {
    if (initialFilters.min_price && initialFilters.max_price) {
      const min = Number(initialFilters.min_price);
      const max = Number(initialFilters.max_price);

      if (min === 0 && max === 500000) setSelectedPriceRange("under500k");
      else if (min === 500000 && max === 1000000)
        setSelectedPriceRange("500k-1m");
      else if (min === 1000000 && max === 5000000)
        setSelectedPriceRange("1m-5m");
      else if (min === 5000000 && max === 10000000)
        setSelectedPriceRange("5m+");
      else if (min === 10000000 && max === 50000000)
        setSelectedPriceRange("10m+");
      else if (min === 50000000 && max === 99999999)
        setSelectedPriceRange("50m+");
      else setSelectedPriceRange(""); // reset nếu không khớp
    } else {
      setSelectedPriceRange("");
    }
  }, [initialFilters]);

  // hàm đổi khoảng giá
  const handlePriceRangeChange = (e) => {
    const value = e.target.value;
    setSelectedPriceRange(value);

    let min = "";
    let max = "";

    if (value === "under500k") {
      min = 0;
      max = 500000;
    } else if (value === "500k-1m") {
      min = 500000;
      max = 1000000;
    } else if (value === "1m-5m") {
      min = 1000000;
      max = 5000000;
    } else if (value === "5m+") {
      min = 5000000;
      max = 10000000;
    } else if (value === "10m+") {
      min = 10000000;
      max = 50000000;
    } else if (value === "50m+") {
      min = 50000000;
      max = 99999999;
    }

    setLocalFilters((prev) => ({
      ...prev,
      min_price: min,
      max_price: max,
    }));
  };
  useEffect(() => {
    setLocalFilters(initialFilters);
    setError("");
  }, [initialFilters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleApply = () => {
    const min = Number(localFilters.min_price);
    const max = Number(localFilters.max_price);
    const MAX_LIMIT = 100_000_000; // 100 triệu

    if (localFilters.min_price && localFilters.max_price && min > max) {
      setError("Giá tối thiểu phải nhỏ hơn giá tối đa.");
      return;
    }
    if (localFilters.max_price && max > MAX_LIMIT) {
      setError(
        `Giá tối đa không được vượt quá ${MAX_LIMIT.toLocaleString()}đ.`
      );
      return;
    }
    setError("");
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      key: "",
      sku: "",
      categoryId: "",
      min_price: "",
      max_price: "",
      sortBy: "newest",
      page: 1,
    };
    setLocalFilters(defaultFilters);
    setError("");
    onApplyFilters(defaultFilters);
  };

  return (
    <aside className="w-full lg:w-1/4 space-y-6">
      <div className="bg-content p-6 rounded-xl border-themed space-y-4">
        <h3 className="font-heading text-xl font-semibold text-primary flex items-center gap-2">
          <Filter className="text-highlight" />
          Bộ Lọc Tìm Kiếm
        </h3>

        {/* ... (Các ô input SKU và Khoảng giá giữ nguyên) ... */}
        <div>
          <label
            htmlFor="sku"
            className="block text-sm font-medium text-primary mb-1"
          >
            Mã sản phẩm (SKU)
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={localFilters.sku || ""}
            onChange={handleInputChange}
            placeholder="Nhập mã SKU..."
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          />
        </div>

        {/* --- DROPDOWN DANH MỤC ĐA CẤP --- */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-primary mb-1"
          >
            Danh mục game
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={localFilters.categoryId || ""}
            onChange={handleInputChange}
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((parentCategory) => (
              <optgroup key={parentCategory.id} label={parentCategory.name}>
                {parentCategory.children &&
                parentCategory.children.length > 0 ? (
                  parentCategory.children.map((child) =>
                    renderCategoryOption(child)
                  )
                ) : (
                  // Nếu cha không có con thì disable luôn cha
                  <option
                    key={parentCategory.id}
                    value={parentCategory.id}
                    disabled
                  >
                    {parentCategory.name}
                  </option>
                )}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="priceRange"
            className="block text-sm font-medium text-primary mb-1"
          >
            Khoảng giá
          </label>
          <select
            id="priceRange"
            name="priceRange"
            value={selectedPriceRange}
            onChange={handlePriceRangeChange}
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          >
            <option value="">Tất cả giá</option>
            <option value="under500k">Dưới 500.000đ</option>
            <option value="500k-1m">500.000đ - 1.000.000đ</option>
            <option value="1m-5m">1.000.000đ - 5.000.000đ</option>
            <option value="5m+">5.000.000đ - 10.000.000đ</option>
            <option value="10m+">10.000.000đ - 50.000.000đ</option>
            <option value="50m+">Trên 50.000.000đ</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleApply}
            className="action-button action-button-primary flex-1"
          >
            Áp dụng
          </button>
          <button
            onClick={handleReset}
            className="action-button action-button-secondary p-3"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/http";
import { useHome } from "@contexts/HomeContext";

import Product from "../../../components/Client/product/Product";
import ProductCardSkeleton from "../../../components/Client/product/ProductCardSkeleton";
import Breadcrumbs from "../../../utils/Breadcrumbs";

// Hook lấy dữ liệu tìm kiếm (giữ nguyên)
const useProductSearch = (filters) => {
  return useQuery({
    queryKey: ["products_search", filters],
    queryFn: async () => {
      // Loại bỏ các key có giá trị rỗng hoặc null trước khi gửi đi
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== "")
      );
      const params = new URLSearchParams(cleanFilters);
      const { data } = await api.get(`/home/products?${params}`);
      return data;
    },
    keepPreviousData: true,
  });
};

// Hook lấy danh mục
const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data.data.treeCategories; // lấy đúng treeCategories từ API
    },
    staleTime: 1000 * 60 * 5, // cache 5 phút
  });
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { homeData } = useHome();

  // Gọi API lấy danh mục
  const { data: categoriesTree = [], isLoading: loadingCategories } = useCategories();


  // Lấy tất cả các tham số từ URL và tạo thành một object filters
  const filters = {
    key: searchParams.get("key") || "",
    sku: searchParams.get("sku") || "",
    categoryId: searchParams.get("categoryId") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    page: parseInt(searchParams.get("page") || "1", 10),
  };

  const { data: productsData, isLoading } = useProductSearch(filters);

  // Hàm này được gọi từ FilterSidebar để áp dụng bộ lọc mới
  const handleApplyFilters = (newFilters) => {
    // Luôn reset về trang 1 khi áp dụng bộ lọc mới
    newFilters.page = 1;
    setSearchParams(newFilters);
  };

  // Hàm xử lý sắp xếp
  // const handleSortChange = (e) => {
  //   const newSortValue = e.target.value;
  //   const currentParams = new URLSearchParams(searchParams);
  //   currentParams.set("sortBy", newSortValue);
  //   currentParams.set("page", "1"); // Reset trang khi sắp xếp
  //   setSearchParams(currentParams);
  // };

  // --- HÀM PHÂN TRANG ĐÃ ĐƯỢC SỬA LỖI ---
  const handlePageChange = (newPage) => {
    if (newPage && newPage !== filters.page) {
      // Tạo một bản sao của các tham số hiện tại và chỉ cập nhật 'page'
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("page", newPage);
      setSearchParams(currentParams);
    }
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Tìm kiếm sản phẩm" },
  ];

  return (
    <div className="max-w-screen-xl mx-auto min-h-screen ">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <FilterSidebar
          categories={categoriesTree}
          initialFilters={filters}
          onApplyFilters={handleApplyFilters}
        />

        <main className="w-full lg:w-3/4 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-content p-3 rounded-xl border-themed">
            {/* --- HIỂN THỊ KẾT QUẢ ĐÃ CẬP NHẬT --- */}
            <div className="text-sm text-secondary mb-2 sm:mb-0">
              <span>Tìm thấy </span>
              <strong className="text-primary">
                {productsData?.total || 0}
              </strong>
              <span> kết quả</span>
              {/* Hiển thị thêm từ khóa nếu có */}
              {filters.key && (
                <>
                  <span> cho </span>
                  <strong className="text-highlight">"{filters.key}"</strong>
                </>
              )}
            </div>

            {/* <div className="flex items-center gap-2">
              <label
                htmlFor="sortBy"
                className="text-sm font-medium text-primary"
              >
                Sắp xếp:
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleSortChange}
                className="text-sm rounded-lg border-hover bg-input text-input p-2"
              >
                <option value="newest">Mới nhất</option>
                <option value="featured">Nổi bật</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div> */}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : productsData?.data.map((p) => (
                  <Product key={p.id} product={p} />
                ))}
          </div>

          {!isLoading && productsData?.data.length === 0 && (
            <div className="text-center py-16 bg-content rounded-lg">
              <p className="text-secondary">Không tìm thấy sản phẩm nào.</p>
            </div>
          )}

          {productsData && productsData.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {productsData.links.map((link, index) => {
                const pageNumber = link.url
                  ? new URL(link.url).searchParams.get("page")
                  : null;
                return (
                  <button
                    key={index}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={!link.url || isLoading}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      link.active
                        ? "bg-primary text-white shadow-md"
                        : "bg-card hover:bg-gray-200 dark:hover:bg-gray-700"
                    } ${
                      !link.url
                        ? "text-gray-400 cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
