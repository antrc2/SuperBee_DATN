// import React, { useState } from "react";
import { Crown, Trophy, Medal, Zap } from "lucide-react";
import Left from "@assets/tn/left.png";
import Right from "@assets/tn/right.png";
import { formatCurrencyVND } from "../../../utils/hook";

export default function AnimeTopUpLeaderboard({ top }) {
  // const [top] = useState([
  //   { user: { username: "admin" }, balance: 456367 },
  //   { user: { username: "reseller" }, balance: 555554 },
  //   { user: { username: "userHoi" }, balance: 3555 },
  //   { user: { username: "partner" }, balance: 55 },
  //   { user: { username: "player123" }, balance: 12500 },
  // ]);

  // const getRankIcon = (index) => {
  //   return null;
  // };

  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 border-yellow-400/20";
      case 1:
        return "bg-gradient-to-r from-gray-400/10 to-gray-300/10 border-gray-300/20";
      case 2:
        return "bg-gradient-to-r from-orange-500/10 to-orange-400/10 border-orange-400/20";
      default:
        return "bg-gray-800/50 border-gray-700/50";
    }
  };

  const getBadgeText = (index) => {
    switch (index) {
      case 0:
        return "👑 Vua Nạp Thẻ";
      case 1:
        return "🏆 Cao Thủ";
      case 2:
        return "🥉 Chuyên Gia";
      case 3:
        return "⭐ Tài Năng";
      case 4:
        return "🌟 Tân Binh";
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-content">
      {/* Header đơn giản */}
      <div className=" p-4 text-center border-b border-[var(--bg-content-700)] relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-white text-sm font-medium flex-4/6">
            Bảng Xếp Hạng
          </h3>
        </div>
      </div>

      {/* Danh sách 5 người */}
      <div className="p-3 space-y-2">
        {top.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-800/30 ${getRankBg(
              index
            )}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Avatar nhỏ cho mỗi user */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-300 to-blue-300 flex items-center justify-center">
                  <div className="text-xs">
                    {index === 0
                      ? "🌸"
                      : index === 1
                      ? "⚡"
                      : index === 2
                      ? "🍀"
                      : index === 3
                      ? "🎮"
                      : "💫"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-200 font-medium">
                      {entry.user?.username}
                    </span>
                    {index < 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs text-purple-300 border border-purple-500/30">
                        VIP
                      </span>
                    )}
                  </div>
                  {getBadgeText(index) && (
                    <div className="text-xs text-gray-400">
                      {getBadgeText(index)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-sm font-medium text-gray-200">
                  {formatCurrencyVND(entry.balance)}
                </span>
                <span className="text-xs text-gray-400">VND</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button nạp thẻ đơn giản */}
      <div className="p-3 border-t  border-[var(--bg-content-700)]">
        <button className="w-full py-2.5 container-div text-main-title text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
          <span className="text-sm">⚡</span>
          Nạp thẻ ngay
          <span className="text-sm">💎</span>
        </button>
      </div>
    </div>
  );
}
