import React, { useState } from "react";

export default function Recharge() {
  const [isCardTab, setIsCardTab] = useState(true);

  const handleTabSwitch = (tab) => {
    setIsCardTab(tab === "card");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Nạp tiền</h1>

      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => handleTabSwitch("card")}
          className={`px-4 py-2 font-medium ${
            isCardTab
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          Nạp thẻ cào
        </button>
        <button
          onClick={() => handleTabSwitch("atm")}
          className={`px-4 py-2 font-medium ${
            !isCardTab
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          ATM tự động
        </button>
      </div>

      {isCardTab ? (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nhà cung cấp</label>
            <select className="w-full p-2 border rounded">
              <option>VIETTEL</option>
              <option>MOBIFONE</option>
              <option>VINAPHONE</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Mã số thẻ</label>
            <input
              className="w-full p-2 border rounded"
              placeholder="Nhập mã số thẻ của bạn"
            />
            <p className="text-sm text-red-500">Bạn chưa nhập mã pin</p>
          </div>
          <div>
            <label className="block mb-1 font-medium">Số sê-ri</label>
            <input
              className="w-full p-2 border rounded"
              placeholder="Nhập mã số sê-ri trên thẻ"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mã bảo vệ</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 p-2 border rounded"
                placeholder="Nhập mã bảo vệ"
              />
              <span className="text-xl font-semibold">2 5 7</span>
              <button className="text-blue-500">🔄</button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Chọn mệnh giá</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000,
                1000000
              ].map((value) => (
                <button
                  key={value}
                  className="border p-2 rounded hover:border-blue-500"
                >
                  {value.toLocaleString()}đ <br />{" "}
                  <span className="text-sm">Nhận 100.0%</span>
                </button>
              ))}
            </div>
            <p className="text-red-600 text-sm mt-1">
              *Chú ý: Nạp thẻ sai mệnh giá mất 100% giá trị thẻ.
            </p>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-4">
            Nạp Ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p>
            <strong>*Nạp bằng ATM:</strong>
          </p>
          <table className="w-full border border-gray-300 text-sm">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2">Tên chủ tài khoản:</td>
                <td className="p-2 font-semibold">HA DUC MANH</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2">Ngân hàng:</td>
                <td className="p-2 font-semibold">ACB</td>
              </tr>
              <tr>
                <td className="p-2">Chi nhánh:</td>
                <td className="p-2 font-semibold">HÀ NỘI</td>
              </tr>
            </tbody>
          </table>
          <p className="text-red-600 font-medium">
            NAP 100K ATM NHẬN 110K SHOP (TẶNG 10%)
          </p>
          <p>
            Nếu sau 5 phút không được cộng tiền vui lòng liên hệ ZALO{" "}
            <strong>0365818471</strong> để được xử lý.
          </p>
          <p className="text-sm italic text-gray-600">
            *Chú ý: Chuyển đúng cú pháp, sai nội dung bị chuyển qua ID khác shop
            không chịu trách nhiệm
          </p>
          <div>
            <label className="block font-medium mb-1">
              NỘI DUNG CHUYỂN KHOẢN:
            </label>
            <input
              className="w-full p-2 border rounded"
              readOnly
              value="NAP SHOPT1 2904356"
            />
          </div>
          <div className="text-center mt-4">
            <img
              src="/vietqr.png" // replace with actual QR code path
              alt="QR Code"
              className="mx-auto w-48"
            />
            <p className="text-xs mt-2">napas 24/7 - ACB</p>
          </div>
        </div>
      )}
    </div>
  );
}
