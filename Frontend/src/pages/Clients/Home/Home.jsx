import React from "react";
import { useHome } from "@contexts/HomeContext";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import ListProducts from "../../../sections/Home/ListProducts";
import CategorySlider from "../../../sections/Home/CategorySlider";
import ReviewWeb from "../../../sections/Home/ReviewWeb";

export default function Home() {
  const { homeData, isLoading } = useHome(); // Sử dụng isLoading từ context

  // homeData được select trong context nên nó là response.data
  const { banners, top_users, categories, featured_products, newest_products } =
    homeData.data || {};

  if (isLoading) {
    return <LoadingDomain />;
  }

  return (
    <div className="space-y-9">
      <BannerAndCart top={top_users ?? []} banner={banners ?? []} />
      <CategorySlider categories={categories?.onlyChildren ?? []} />
      <ListProducts
        title="Sản Phẩm Nổi Bật"
        subtitle="Khám phá những tài khoản được yêu thích và mua nhiều nhất"
        products={featured_products ?? []}
        viewMoreLink="/search?sortBy=featured" // Link tới trang search với filter nổi bật
      />

      {/* Sản Phẩm Mới Nhập */}
      <ListProducts
        title="Mới Mở Bán"
        subtitle="Những tài khoản game chất lượng cao vừa được cập nhật"
        products={newest_products ?? []}
        viewMoreLink="/search?sortBy=newest" // Link tới trang search với filter mới nhất
      />

      {/* Reviews của Website */}
      <ReviewWeb />
    </div>
  );
}