import React from "react";

export default function CategoryCon({ item }) {
  return (
    <div className="w-full">
      <div>
        <img
          className="w-full h-full min-w-[40px]
          min-h-[200px] border rounded-2xl inset-shadow-2xs block object-contain"
          src={
            item?.image ??
            "https://i.pinimg.com/736x/9b/aa/66/9baa66a3fb33bfcea3e8b791dee5d1c7.jpg"
          }
        />
      </div>
      <div className="text-start">
        <strong className="text-[17px] block text-sm truncate">
          {item?.name ?? "Info nik"}
        </strong>
      </div>
      <div>
        Số tài khoản: <span>{item?.count ?? "123.333"}</span>
      </div>
    </div>
  );
}
