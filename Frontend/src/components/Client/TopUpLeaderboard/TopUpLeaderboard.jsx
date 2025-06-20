import { Crown, Trophy, Medal, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopUpLeaderboard({ top }) {
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Trophy className="h-4 w-4 text-slate-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-xs font-medium text-white">
            {index + 1}
          </div>
        );
    }
  };

  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20";
      case 1:
        return "bg-gradient-to-r from-slate-500/10 to-slate-400/10 border-slate-400/20";
      case 2:
        return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/20";
      default:
        return "bg-slate-800/50 border-slate-700";
    }
  };

  return (
    <div className="w-full max-w-sm rounded-lg bg-slate-800 border border-slate-700 shadow-lg ">
      {/* Leaderboard */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {top.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-slate-700/50 ${getRankBg(
              index
            )}`}
          >
            <div className="flex items-center gap-3">
              {getRankIcon(index)}
              <div>
                <span className="text-sm text-white font-medium">
                  {entry.user?.username}
                </span>
                {index < 3 && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {index === 0
                      ? "Vua nạp thẻ"
                      : index === 1
                      ? "Cao thủ"
                      : "Chuyên gia"}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span className="text-sm font-semibold text-white">
                  {entry.balance}
                  <sup className="text-xs text-slate-400">đ</sup>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="p-4 border-t border-slate-700">
        <Link to={"/recharge-atm"}>
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <Zap className="h-4 w-4" />
            Nạp thẻ ngay
          </button>
        </Link>
      </div>
    </div>
  );
}
