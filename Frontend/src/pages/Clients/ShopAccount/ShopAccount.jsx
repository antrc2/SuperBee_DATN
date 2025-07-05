import React from "react";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import { useHome } from "@contexts/HomeContext";

export default function ShopAccount() {
  const { homeData } = useHome();
  return (
    <div>
      <div className="max-w-7xl mx-auto mt-3">
        <Breadcrumbs />
      </div>
      <div className="mt-8">
        <ListCategoryCon items={homeData?.categories?.onlyChildren} count={9} />
      </div>
    </div>
  );
}
