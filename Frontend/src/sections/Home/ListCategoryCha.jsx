import React, { useState } from "react";
import CategoryCha from "../../components/Client/Category/CategoryCha";

export default function ListCategoryCha() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: "THU ACC\nTHANH LÝ ALL...",
      image:
        "https://static2.mingame89.store/19426957-cdnimaget1/upload/images/ChatGPT%20Image%2023_57_43%209%20thg%205%2C%202025.png" // Đường dẫn ảnh mẫu
    },
    {
      id: 2,
      name: "ACC LIÊN QUÂN\nSALE",
      image:
        "https://i.pinimg.com/736x/dc/af/d3/dcafd352eab91abd9fbc09f615da7f5d.jpg"
    },
    {
      id: 3,
      name: "ACC BLOX\nFRUITS GIÁ RẺ",
      image:
        "https://i.pinimg.com/736x/63/4a/3b/634a3bc0c0844a891a7d81d2bc88b9b7.jpg"
    },
    {
      id: 4,
      name: "ACC FREE FIRE\nGIÁ RẺ",
      image:
        "https://i.pinimg.com/736x/9b/aa/66/9baa66a3fb33bfcea3e8b791dee5d1c7.jpg"
    },
    {
      id: 5,
      name: "ACC TFT ĐCTL\nGIÁ RẺ",
      image:
        "https://static2.mingame89.store/19426957-cdnimaget1/upload/images/thiet-ke-4.png"
    },
    {
      id: 6,
      name: "ACC VALORANT",
      image:
        "https://static2.mingame89.store/19426957-cdnimaget1/upload/images/cfae886e263126f685510e2f45b82970.jpg"
    }
  ]);

  return (
    <div className="flex gap-2 justify-between px-16 max-w-7xl mx-auto mt-10">
      {accounts.map((acc) => (
        <CategoryCha key={acc.id} item={acc} />
      ))}
    </div>
  );
}
