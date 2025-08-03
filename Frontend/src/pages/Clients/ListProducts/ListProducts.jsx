import React from "react";
import Product from "../../../components/Client/product/Product";
import LoadingDomain from "@components/Loading/LoadingDomain";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import { useParams } from "react-router-dom";
import NoProduct from "../../../components/Loading/NoProduct";
import { useQuery } from "@tanstack/react-query";
import ServerErrorDisplay from "../../../components/Loading/ServerErrorDisplay";
import { getProductsBySlug } from "../../../services/productService.js";
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
    enabled: !!slug,
  });
  if (isLoadingProducts) {
    return <LoadingDomain />;
  }
  if (isErrorProducts) {
    return (
      <ServerErrorDisplay statusCode={errorProducts.response?.status || 500} />
    );
  }
  if (!ListProducts?.data) {
    return <NoProduct />;
  }
  const breadcrumbItems = ListProducts
    ? [
        { label: "Trang chủ", href: "/" },
        { label: "Mua Acc", href: "/mua-acc" },
        { label: `${slug}` },
      ]
    : [];
  return (
    <>
      <div className=" mt-5">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 ">
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
