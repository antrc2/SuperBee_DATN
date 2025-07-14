import React, { useState } from "react";
import { Trophy, Zap, Landmark, CreditCard } from "lucide-react";
import { formatCurrencyVND } from "../../../config/recharge";

import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CardRechargeForm,
  BankRechargeTab,
} from "../Recharge/CardRechargeForm";

const LeaderboardList = ({ top }) => {
  console.log("🚀 ~ LeaderboardList ~ top:", top);
  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-400/10 border-yellow-400/30";
      case 1:
        return "bg-gray-400/10 border-gray-400/30";
      case 2:
        return "bg-orange-400/10 border-orange-400/30";
      default:
        return "border-themed/50";
    }
  };
  const getBadgeText = (index) =>
    ({
      0: "👑 Vua Nạp Thẻ",
      1: "🏆 Cao Thủ",
      2: "🥉 Chuyên Gia",
      3: "⭐ Tài Năng",
      4: "🌟 Tân Binh",
    }[index]);

  return (
    <div className="p-3 space-y-2 animate-fade-in">
      {top.map((entry, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getRankBg(
            index
          )}`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`font-bold text-lg w-5 text-center ${
                index < 3 ? "text-highlight" : "text-secondary"
              }`}
            >
              {index + 1}
            </span>
            <div>
              <span className="text-sm text-primary font-medium">
                {entry.user?.username}
              </span>
              <div className="text-xs text-secondary">
                {getBadgeText(index)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-highlight" />
              <span className="text-sm font-medium text-primary">
                {formatCurrencyVND(entry.balance)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
import { useNotification } from "@contexts/NotificationContext";
export default function TopUpLeaderboard({ top }) {
  const [activeTab, setActiveTab] = useState("leaderboard"); // Mặc định là tab Top Nạp
  const [rechargeMethod, setRechargeMethod] = useState("card");
  const { pop } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleRechargeClick = () => {
    if (user) {
      // Nếu đã đăng nhập, chuyển sang tab nạp tiền
      setRechargeMethod("bank");
    } else {
      pop("Vui lòng đăng nhập để nạp tiền", "i");
      localStorage.setItem("location", "/recharge-atm");
      navigate("/auth/login");
    }
  };

  return (
    <div className="w-full bg-content rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header với các Tab Chéo */}
      <div className="p-2 border-b border-themed">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setActiveTab("recharge")}
            className={`tab-button-slanted ${
              activeTab === "recharge" ? "tab-button-slanted-active" : ""
            }`}
          >
            <div className="content flex items-center justify-center gap-1">
              <span>
                <Zap size={14} />
              </span>{" "}
              <span>Nạp Tiền</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`tab-button-slanted ${
              activeTab === "leaderboard" ? "tab-button-slanted-active" : ""
            }`}
          >
            <span className="content flex items-center justify-center gap-1">
              <Trophy size={14} /> Top Nạp
            </span>
          </button>
        </div>
      </div>

      {/* Vùng nội dung động */}
      <div className="flex-grow overflow-y-auto custom-scrollbar-notification p-4 h-[400px]">
        {activeTab === "recharge" ? (
          <div>
            <div className="flex items-center justify-center gap-2 mb-4 bg-primary/5 p-1 rounded-lg">
              <button
                onClick={() => setRechargeMethod("card")}
                className={`tab-button text-xs ${
                  rechargeMethod === "card" ? "tab-button-active" : ""
                }`}
              >
                <CreditCard size={14} className="inline-block mr-1" /> Thẻ Cào
              </button>
              <button
                onClick={handleRechargeClick}
                className={`tab-button text-xs ${
                  rechargeMethod === "bank" ? "tab-button-active" : ""
                }`}
              >
                <Landmark size={14} className="inline-block mr-1" /> Ngân Hàng
              </button>
            </div>
            {rechargeMethod === "card" ? (
              <CardRechargeForm />
            ) : (
              <BankRechargeTab user={user} />
            )}
          </div>
        ) : (
          <LeaderboardList top={top} />
        )}
      </div>
    </div>
  );
}
