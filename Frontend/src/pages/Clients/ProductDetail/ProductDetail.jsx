import React, { useState } from "react";

export default function ProductDetail() {
  const accountData = {
    id: "UEU1385814",
    name: "Nick Liên Quân Reg",
    rank: "Đồng",
    registration: "Trắng Thông Tin",
    champions: 5,
    skins: 5,
    originalPrice: 150000,
    discountedPrice: 100000,
    momoPrice: 90000,
    discountPercent: 33,
    mainImage: "/images/main.jpg",
    thumbnails: [
      "/images/thumb1.jpg",
      "/images/thumb2.jpg",
      "/images/thumb3.jpg"
    ],
    description: "Rẻ vô đối, giá tốt nhất thị trường"
  };

  const [mainImg, setMainImg] = useState(accountData.mainImage);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-lg max-w-6xl mx-auto">
      {/* Image Section */}
      <div className="flex flex-col items-center">
        <img
          src={mainImg}
          alt="Main Preview"
          className="w-80 h-60 object-cover rounded-lg"
        />
        <div className="flex gap-2 mt-4">
          {accountData.thumbnails.map((thumb, index) => (
            <img
              key={index}
              src={thumb}
              alt={`Thumb ${index + 1}`}
              className="w-16 h-16 object-cover rounded cursor-pointer border hover:border-blue-500"
              onClick={() => setMainImg(thumb)}
            />
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 space-y-4">
        <h2 className="text-2xl font-bold uppercase">{accountData.name}</h2>
        <p className="text-gray-500">Mã số: #{accountData.id}</p>

        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
          <p>
            Mức Rank: <span className="font-medium">{accountData.rank}</span>
          </p>
          <p>
            Đăng Ký:{" "}
            <span className="font-medium">{accountData.registration}</span>
          </p>
          <p>
            Số Tướng:{" "}
            <span className="font-medium">{accountData.champions}</span>
          </p>
          <p>
            Số Skin: <span className="font-medium">{accountData.skins}</span>
          </p>
        </div>

        <div className="text-pink-500 text-3xl font-bold">
          {accountData.discountedPrice.toLocaleString()}đ
          <span className="text-blue-500 text-sm ml-2">
            -{accountData.discountPercent}%
          </span>
        </div>
        <p className="text-sm text-gray-400 line-through">
          {accountData.originalPrice.toLocaleString()}đ
        </p>
        <p className="text-sm text-gray-600">{accountData.description}</p>

        <div className="flex flex-col gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg">
            Mua Ngay
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-lg">
            Mua Bằng ATM, Momo <br />
            <span className="text-sm">
              {accountData.momoPrice.toLocaleString()}đ
            </span>
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Chi tiết dịch vụ</h3>
          <p className="text-sm text-gray-600">Xem</p>
        </div>
      </div>
    </div>
  );
}
