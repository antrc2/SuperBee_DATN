import { Star } from "lucide-react";
const leaderboardData = [
  { rank: 1, username: "****autrai", amount: "10.800.000" },
  { rank: 2, username: "****79631370...", amount: "9.000.000" },
  { rank: 3, username: "****htrd", amount: "4.440.000" },
  { rank: 4, username: "****beo", amount: "3.850.000" },
  { rank: 5, username: "****ang", amount: "3.520.000" },
];

export default function TopUpLeaderboard({ top }) {
  console.log("🚀 ~ TopUpLeaderboard ~ top:", top);
  return (
    <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm h-[400px]">
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <h2 className="font-bold text-gray-800">TOP NẠP THẺ THÁNG 5</h2>
      </div>

      <div className="space-y-4">
        {top.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {index < 3 ? (
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  {index + 1}
                </div>
              )}
              <span className="text-sm text-gray-700">
                {entry.user?.username}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-800">
                {entry.balance}
                <sup className="text-xs">đ</sup>
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-md bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
        Nạp thẻ ngay
      </button>
    </div>
  );
}
