import React from "react";

export default function ProductHistory({ item }) {
  return (
    <div className="max-w-52 max-h-52">
      <div>
        <img
          className="min-w-52 max-h-40 min-h-40 
         border rounded-2xl inset-shadow-2xs block object-cover"
          src={
            item?.image ??
            "https://i.pinimg.com/736x/9b/aa/66/9baa66a3fb33bfcea3e8b791dee5d1c7.jpg"
          }
        />
      </div>
      <div className="text-start">
        <strong className="text-[17px] block text-sm truncate">
          {item?.code ?? "Info nik"}
        </strong>
      </div>
      <div>
        giao dịch: <span>{item?.price ?? "123.333"}</span>
      </div>
    </div>
  );
}
