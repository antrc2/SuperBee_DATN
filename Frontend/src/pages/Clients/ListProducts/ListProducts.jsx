import React from "react";
import Product from "../../../components/Client/product/Product";
import LoadingDomain from "@components/Loading/LoadingDomain";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import { useParams } from "react-router-dom";
import NoProduct from "../../../components/Loading/NoProduct";
import { useQuery } from "@tanstack/react-query";
import ServerErrorDisplay from "../../../components/Loading/ServerErrorDisplay";
import { getProductsBySlug } from "../../../services/productService.js";
import CategoryCha from "../../../components/Client/Category/CategoryCha.jsx";
import CategoryCon from "../../../components/Client/Category/CategoryCon.jsx";
export default function ListProducts() {
  const { slug } = useParams();

  const {
    data: ListProducts,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useQuery({
    queryKey: ["listProducts", slug],
    queryFn: () => getProductsBySlug(slug),
    enabled: !!slug, // Đảm bảo query chỉ chạy khi slug có giá trị (không phải undefined)
  });
  if (isLoadingProducts) {
    return <LoadingDomain />;
  }

  // Xử lý trạng thái lỗi tổng thể
  if (isErrorProducts) {
    return (
      <ServerErrorDisplay statusCode={errorProducts.response?.status || 500} />
    );
  }

  // Nếu không có sản phẩm hoặc data rỗng sau khi fetch
  if (!ListProducts?.data) {
    return <NoProduct />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto mt-5">
        <Breadcrumbs category={ListProducts?.data?.category} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
        {ListProducts?.data?.type == 1
          ? ListProducts?.data?.products.map((product, index) => (
              <Product key={product.id || index} product={product} /> // Ưu tiên dùng product.id làm key
            ))
          : ListProducts?.data?.categories.map((cate, index) => (
              <CategoryCon key={index} item={cate} /> // Ưu tiên dùng product.id làm key
            ))}
      </div>
      {ListProducts?.data?.type == 1 ? (
        ListProducts.data.products.length === 0 ? (
          <NoProduct />
        ) : (
          ""
        )
      ) : ListProducts.data.categories.length === 0 ? (
        <NoProduct />
      ) : (
        ""
      )}
    </>
  );
}
