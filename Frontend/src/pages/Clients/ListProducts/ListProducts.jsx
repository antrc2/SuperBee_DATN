// src/pages/Client/ListProducts/ListProducts.jsx
import React from "react";
import Product from "../../../components/Client/product/Product";
import LoadingDomain from "@components/Loading/LoadingDomain";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import { useParams, useSearchParams } from "react-router-dom";
import NoProduct from "../../../components/Loading/NoProduct";
import { useQuery } from "@tanstack/react-query";
import ServerErrorDisplay from "../../../components/Loading/ServerErrorDisplay";
import { getProductsWithFilter, getProductsBySlug } from "../../../services/productService.js";
import CategoryCha from "../../../components/Client/Category/CategoryCha.jsx";
import ProductFilter from "../../../components/Client/Filter/ProductFilter.jsx";

export default function ListProducts() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse URL parameters
  const filters = {
    key: searchParams.get("key") || "",
    sku: searchParams.get("sku") || "",
    categoryId: searchParams.get("categoryId") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    attribute_key: searchParams.get("attribute_key") || "",
    attribute_value: searchParams.get("attribute_value") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "12", 10),
  };

  // Determine if we have any active filters
  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "page" || key === "limit") return false;
    if (key === "sortBy" && value === "newest") return false;
    return value !== "" && value != null;
  });

  // Query để lấy dữ liệu
  const {
    data: ListProducts,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useQuery({
    queryKey: ["listProducts", slug, filters],
    queryFn: async () => {
      if (hasFilters) {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => {
            if (key === "sortBy" && value === "newest") return false;
            return value != null && value !== "";
          })
        );
        return await getProductsWithFilter(slug, cleanFilters);
      } else {
        return await getProductsBySlug(slug);
      }
    },
    enabled: !!slug,
    keepPreviousData: true,
  });

  // Handle filter changes
  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.key) params.append("key", newFilters.key);
    if (newFilters.sku) params.append("sku", newFilters.sku);
    if (newFilters.categoryId) params.append("categoryId", newFilters.categoryId);
    if (newFilters.min_price) params.append("min_price", newFilters.min_price);
    if (newFilters.max_price) params.append("max_price", newFilters.max_price);
    if (newFilters.attribute_key) params.append("attribute_key", newFilters.attribute_key);
    if (newFilters.attribute_value) params.append("attribute_value", newFilters.attribute_value);
    if (newFilters.sortBy && newFilters.sortBy !== "newest") {
      params.append("sortBy", newFilters.sortBy);
    }
    if (newFilters.page && newFilters.page !== 1) {
      params.append("page", newFilters.page);
    }
    if (newFilters.limit && newFilters.limit !== 12) {
      params.append("limit", newFilters.limit);
    }
    setSearchParams(params, { replace: true });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage && newPage !== filters.page) {
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("page", newPage);
      setSearchParams(currentParams, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle sort change
  // const handleSortChange = (e) => {
  //   const newSortValue = e.target.value;
  //   const currentParams = new URLSearchParams(searchParams);
  //   if (newSortValue !== "newest") {
  //     currentParams.set("sortBy", newSortValue);
  //   } else {
  //     currentParams.delete("sortBy");
  //   }
  //   currentParams.set("page", "1");
  //   setSearchParams(currentParams, { replace: true });
  // };

  if (isLoadingProducts) return <LoadingDomain />;
  if (isErrorProducts) {
    return <ServerErrorDisplay statusCode={errorProducts.response?.status || 500} />;
  }
  if (!ListProducts?.data) return <NoProduct />;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Mua Acc", href: "/mua-acc" },
    { label: slug },
  ];

  const isProductList = ListProducts?.data?.type === 1;
  const hasProducts = isProductList && ListProducts?.data?.products?.length > 0;
  const hasCategories = !isProductList && ListProducts?.data?.categories?.length > 0;

  return (
    <div className="max-w-screen-xl mx-auto min-h-screen">
      <div className="mt-5">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {isProductList ? (
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <ProductFilter slug={slug} initialFilters={filters} onApplyFilters={handleApplyFilters} />

          <main className="w-full lg:w-3/4 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-content p-3 rounded-xl border-themed">
              <div className="text-sm text-secondary mb-2 sm:mb-0">
                <span>Hiển thị </span>
                <strong className="text-primary">
                  {ListProducts?.data?.pagination
                    ? `${ListProducts.data.products.length} / ${ListProducts.data.pagination.total}`
                    : ListProducts?.data?.products?.length || 0}
                </strong>
                <span> sản phẩm</span>
              </div>

              {/* <div className="flex items-center gap-2">
                <label htmlFor="sortBy" className="text-sm font-medium text-primary">
                  Sắp xếp:
                </label>
                <select
                  id="sortBy"
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

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {ListProducts?.data?.products?.map((product, index) => (
                <Product key={product.id || index} product={product} />
              ))}
            </div>

            {ListProducts?.data?.pagination && ListProducts.data.pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {ListProducts.data.pagination.links?.map((link, index) => {
                  const pageNumber = link.url
                    ? new URL(link.url).searchParams.get("page")
                    : null;
                  return (
                    <button
                      key={index}
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={!link.url || isLoadingProducts}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        link.active
                          ? "bg-primary text-white shadow-md"
                          : "bg-card hover:bg-gray-200 dark:hover:bg-gray-700"
                      } ${!link.url ? "text-gray-400 cursor-not-allowed opacity-50" : ""}`}
                    />
                  );
                })}
              </div>
            )}

            {!hasProducts && <NoProduct />}
          </main>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 mt-6">
          {ListProducts?.data?.categories?.map((cate, index) => (
            <CategoryCha key={index} item={cate} />
          ))}
          {!hasCategories && <NoProduct />}
        </div>
      )}
    </div>
  );
}
