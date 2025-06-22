import React from "react";
import TopUpLeaderboard from "../../components/Client/TopUpLeaderboard/TopUpLeaderboard";
import Banner3D from "../../components/Client/banner/Banner";

export default function BannerAndCart({ top, banner }) {
  const money = top.filter((e) => e.balance > 0);
  return (
    <div className="flex gap-6 max-w-7xl mx-auto p-4">
      {money.length > 0 ? (
        <>
          <div className="w-1/3">
            <TopUpLeaderboard top={top} />
          </div>
          <div className="w-2/3">
            <Banner3D banner={banner} />
          </div>
        </>
      ) : (
        <div className="w-full h-[80svh]">
          <Banner3D banner={banner} />
        </div>
      )}
    </div>
  );
}
