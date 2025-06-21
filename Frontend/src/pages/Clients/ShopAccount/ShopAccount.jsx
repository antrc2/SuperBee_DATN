import React from "react";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import { useHome } from "../../../contexts/HomeContext";

export default function ShopAccount() {
  const { data } = useHome();
  return (
    <div>
      <div className="max-w-7xl mx-auto mt-3">
        <Breadcrumbs />
      </div>
      {/* LQ */}
      <div className="mt-8">
        <ListCategoryCon
          items={data?.categories?.filter((e) => e.id == 18)}
          count={9}
        />
      </div>
      {/* {/* FF */}
      <div className="mt-8">
        <ListCategoryCon
          items={data?.categories?.filter((e) => e.id == 7)}
          count={8}
        />
      </div>
    </div>
  );
}
