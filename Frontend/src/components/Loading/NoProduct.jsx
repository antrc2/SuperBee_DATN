import React from "react";
import { Frown } from "lucide-react";

export default function NoProduct() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center   ">
      <div className="bg-pink-100 p-4 rounded-full mb-4 animate-bounce">
        <Frown className="w-10 h-10 text-pink-500" />
      </div>
      <h2 className="text-xl font-bold text-pink-600 mb-2">
        Không có sản phẩm nào 🧸
      </h2>
      <p className="text-pink-500 max-w-xs">
        Hiện tại chưa có sản phẩm nào trong danh mục này. Hãy quay lại sau hoặc
        khám phá danh mục khác nhé!
      </p>
    </div>
  );
}
