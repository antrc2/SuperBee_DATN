import React, { useState } from "react";
import ProductHistory from "../../components/Client/product/ProductHistory";

export default function ListProductHistory() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      code: "THU ACC\nTHANH LÝ ALL...",
      price: 4545,
      image:
        "https://static2.mingame89.store/19426957-cdnimaget1/upload/images/ChatGPT%20Image%2023_57_43%209%20thg%205%2C%202025.png", // Đường dẫn ảnh mẫu
    },
    {
      id: 2,
      code: "ACC LIÊN QUÂN\nSALE",
      price: 4545,
      image:
        "https://i.pinimg.com/736x/dc/af/d3/dcafd352eab91abd9fbc09f615da7f5d.jpg",
    },
    {
      id: 3,
      code: "ACC BLOX\nFRUITS GIÁ RẺ",
      price: 4545,
      image:
        "https://i.pinimg.com/736x/63/4a/3b/634a3bc0c0844a891a7d81d2bc88b9b7.jpg",
    },
    {
      id: 4,
      code: "ACC FREE FIRE\nGIÁ RẺ",
      price: 4545,
      image:
        "https://i.pinimg.com/736x/9b/aa/66/9baa66a3fb33bfcea3e8b791dee5d1c7.jpg",
    },
    {
      id: 5,
      code: "ACC TFT ĐCTL\nGIÁ RẺ",
      price: 4545,
      image:
        "https://static2.mingame89.store/19426957-cdnimaget1/upload/images/thiet-ke-4.png",
    },
    {
      id: 6,
      code: "ACC VALORANT",
      price: 4545,
      image:
        "https://static2.mingame89.store/19426957-cdnimaget1/upload/images/cfae886e263126f685510e2f45b82970.jpg",
    },
  ]);

  return (
    <div className="w-full  max-w-screen-xl mx-auto ">
      <div className="flex justify-between items-center mb-3 mt-5">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
          Sản Phẩm đã xem
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {accounts.map((item, index) => (
          <ProductHistory key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
