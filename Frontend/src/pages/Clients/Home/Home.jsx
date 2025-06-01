import { Alert } from "antd";
// import { useEffect, useState } from "react";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import Header from "../../../components/Client/layout/Header";
import Banner3D from "../../../components/Client/banner/Banner";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import ListCategoryCha from "../../../sections/Home/ListCategoryCha";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import RechargeCard from "../RechargeCard/RechargeCard";
export default function Home() {
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   // Giả sử load dữ liệu từ API
  //   setTimeout(() => {
  //     setIsLoading(false); // Khi dữ liệu đã load xong
  //   }, 2000); // Ví dụ: chờ 5 giây
  // }, []);
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
      {/* {isLoading && <LoadingDomain />} */}
      <div className="mt-4">
        <BannerAndCart />
      </div>
      <div>
        <ListCategoryCha />
      </div>
      {/* LQ */}
      <div>
        <ListCategoryCon
          items={sampleData}
          count={5}
          title="KHO NICK LIÊN QUÂN"
        />
      </div>
      {/* FF */}
      <div>
        <ListCategoryCon
          items={sampleData}
          count={8}
          title="KHO NICK FREE FIRE"
        />
      </div>
    </div>
  );
}
