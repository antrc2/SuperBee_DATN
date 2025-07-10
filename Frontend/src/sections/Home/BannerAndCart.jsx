import React from "react";
import Banner3D from "../../components/Client/banner/Banner";
import AnimeTopUpLeaderboard from "../../components/Client/TopUpLeaderboard/TopUpLeaderboard";

export default function BannerAndCart({ top, banner }) {
  // Lọc những người dùng có số dư > 0 để hiển thị bảng xếp hạng
  const money = top.filter((e) => e.balance > 0);

  return (
    <div className="">
      {money.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-4 ">
          <div className="w-full lg:w-2/3 lg:order-2 order-1 md:min-h-[20rem] ">
            <Banner3D banner={banner} />
          </div>
          <div className="w-full lg:w-1/3 lg:order-1 order-2">
            <AnimeTopUpLeaderboard top={top} />
          </div>
        </div>
      ) : (
        <div className="w-full h-[60vh]">
          <Banner3D banner={banner} />
        </div>
      )}
    </div>
  );
}
