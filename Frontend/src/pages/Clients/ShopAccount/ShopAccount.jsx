import React from "react";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";

export default function ShopAccount() {
  const sampleData = [
    {
      name: "Nick Liên Quân Trắng Thông Tin",
      image: "/images/lq1.png",
      count: "18.546"
    },
    {
      name: "NICK LIÊN QUÂN REG",
      image: "/images/lq2.png",
      count: "18.592"
    },
    {
      name: "Nick Liên Quân Có Thông Tin",
      image: "/images/lq3.png",
      count: "18.659"
    },
    {
      name: "Nick Trải Nghiệm Skin Tự Chọn",
      image: "/images/lq4.png",
      count: "18.659"
    },
    {
      name: "Acc Liên Quân Tự Chọn Flash Sale",
      image: "/images/lq5.png",
      count: "18.659"
    },
    {
      name: "Nick Extra Không Hiện",
      image: "/images/lq6.png",
      count: "18.000"
    },
    {
      name: "Nick Liên Quân Có Thông Tin",
      image: "/images/lq3.png",
      count: "18.659"
    }
  ];
  return (
    <div>
      <div className="max-w-7xl mx-auto mt-3">
        <Breadcrumbs />
      </div>
      <div className="mt-5">
        <ListCategoryCon
          items={sampleData}
          count={8}
          title="Chọn game muốn mua account"
        />
      </div>
    </div>
  );
}
