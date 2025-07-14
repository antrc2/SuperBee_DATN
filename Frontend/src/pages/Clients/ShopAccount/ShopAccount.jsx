import React from "react";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import { useHome } from "@contexts/HomeContext";

export default function ShopAccount() {
  const { homeData } = useHome();
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: `Mua acc` },
  ];

  return (
    <div className="py-8 ">
      <div className="max-w-screen-xl mx-auto  ">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div className="px-4">
        <ListCategoryCon
          items={homeData?.data?.categories?.onlyChildren}
          count={9}
        />
      </div>
    </div>
  );
}
