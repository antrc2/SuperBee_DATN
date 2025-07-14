import React, { useState, useEffect } from "react";
import { CreditCard, Landmark, History, Copy, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { CardRechargeForm } from "@components/Client/Recharge/CardRechargeForm"; // Import component chung
import api from "../../../utils/http";
import { BankRechargeTab } from "../../../components/Client/Recharge/CardRechargeForm";

// --- Trang Nạp Tiền Chính ---
export default function RechargeCardPage() {
  const [activeTab, setActiveTab] = useState("card");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    if (user === null) {
      localStorage.setItem("location", "/recharge-atm");
      navigate("/auth/login");
    } else if (user) {
      // Nếu đã đăng nhập, tải lịch sử
      const fetchHistory = async () => {
        try {
          const historyRes = await api.get("/donate/history");
          setHistory(historyRes.data);
        } catch (error) {
          console.error("Lỗi khi tải lịch sử nạp:", error);
        }
      };
      fetchHistory();
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-center text-primary mb-8">
          Nạp Tiền Vào Tài Khoản
        </h1>

        <div className="mb-8 flex justify-center border-b border-themed">
          <button
            onClick={() => setActiveTab("card")}
            className={`tab-button !flex-none ${
              activeTab === "card" ? "tab-button-active" : ""
            }`}
          >
            <CreditCard size={18} className="inline mr-2" /> Nạp Thẻ Cào
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`tab-button !flex-none ${
              activeTab === "bank" ? "tab-button-active" : ""
            }`}
          >
            <Landmark size={18} className="inline mr-2" /> Nạp Qua Ngân Hàng
          </button>
        </div>

        {activeTab === "card" ? (
          <CardRechargeForm />
        ) : (
          <BankRechargeTab user={user} />
        )}

        <div className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-primary mb-6 flex items-center">
            <History size={24} className="mr-3 text-highlight" /> Lịch Sử Nạp
            Tiền
          </h2>
          <div className="bg-content rounded-lg shadow-lg overflow-x-auto">
            {history.length > 0 ? (
              <table className="w-full min-w-[600px] text-sm">
                {/* JSX cho bảng lịch sử */}
              </table>
            ) : (
              <p className="p-6 text-center text-secondary">
                Chưa có lịch sử nạp tiền.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
