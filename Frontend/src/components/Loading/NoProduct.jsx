import React from "react";
import { PackageSearch } from "lucide-react"; // Icon liên quan đến sản phẩm/hộp đồ

export default function NoProduct() {
  return (
    <div className="flex flex-col items-center justify-center w-full p-10 bg-background rounded-2xl border-2 border-dashed border-themed">
      <div className="w-20 h-20 flex items-center justify-center bg-content-bg rounded-full mb-6">
        <PackageSearch className="w-10 h-10 text-secondary/70" />
      </div>
      <h2 className="text-xl font-bold font-heading text-primary mb-2">
        Chưa có sản phẩm nào
      </h2>
      <p className="text-secondary text-center max-w-xs">
        Hiện tại chưa có sản phẩm nào trong danh mục này. Vui lòng quay lại sau
        nhé!
      </p>
    </div>
  );
}
