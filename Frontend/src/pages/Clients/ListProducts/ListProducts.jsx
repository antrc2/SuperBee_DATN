import React from "react";
import Product from "../../../components/Client/product/Product";
import Breadcrumbs from "../../../utils/Breadcrumbs";

export default function ListProducts() {
  const products = [
    {
      id: "#UEU1408505",
      name: "Nick Free Fire tự chọn",
      register: "Facebook",
      skin: "Súng Vip",
      theVoCuc: "Không",
      rank: "Đồng",
      price: 1700000,
      oldPrice: 2500000,
      discount: 32,
      image: "/images/freefire-1.png"
    },
    ...Array.from({ length: 9 }).map((_, i) => ({
      id: `#UEU14085${i + 6}`,
      name: "Nick Free Fire tự chọn",
      register: i % 2 === 0 ? "Facebook" : "Google",
      skin: i % 3 === 0 ? "Súng Thường" : "Súng Vip",
      theVoCuc: i % 4 === 0 ? "Có" : "Không",
      rank: ["Đồng", "Bạc", "Vàng", "Bạch Kim"][i % 4],
      price: 1500000 + i * 100000,
      oldPrice: 2500000,
      discount: Math.round(
        ((2500000 - (1500000 + i * 100000)) / 2500000) * 100
      ),
      image: `/images/freefire-${(i % 2) + 1}.png`
    }))
  ];
  return (
    <>
      <div className="max-w-7xl mx-auto mt-5">
        <Breadcrumbs />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
        {products.map((product, index) => (
          <Product key={index} product={product} />
        ))}
      </div>
    </>
  );
}
