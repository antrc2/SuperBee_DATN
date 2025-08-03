// src/components/Client/product/ProductCardSkeleton.jsx
import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-content rounded-xl border border-themed overflow-hidden h-full animate-pulse">
      {/* Vùng ảnh chờ */}
      <div className="h-[160px] bg-primary/10"></div>

      {/* Vùng nội dung chờ */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-primary/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-primary/10 rounded w-full"></div>
          <div className="h-3 bg-primary/10 rounded w-5/6"></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-highlight/20 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-highlight/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
