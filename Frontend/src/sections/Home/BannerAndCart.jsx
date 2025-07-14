import React from "react";
import Banner3D from "../../components/Client/banner/Banner";
import TopUpLeaderboard from "../../components/Client/TopUpLeaderboard/TopUpLeaderboard";

export default function BannerAndCart({ top, banner }) {
  console.log("🚀 ~ BannerAndCart ~ top:", top);
  // Lọc người dùng có số dư > 0 để quyết định layout
  const hasLeaderboard = top && top.filter((e) => e.balance > 0).length > 0;

  return (
    <div className="section-bg">
      {hasLeaderboard ? (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Banner chiếm 2/3 không gian */}
          <div className="w-full lg:w-2/3">
            <Banner3D banner={banner} />
          </div>
          {/* Khung Nạp tiền/Top nạp chiếm 1/3 */}
          <div className="w-full lg:w-1/3">
            <TopUpLeaderboard top={top} />
          </div>
        </div>
      ) : (
        // Nếu không có top nạp, banner chiếm toàn bộ không gian
        <div className="w-full">
          <Banner3D banner={banner} />
        </div>
      )}
    </div>
  );
}
