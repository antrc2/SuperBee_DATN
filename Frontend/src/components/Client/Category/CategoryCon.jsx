import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCon({ item }) {
  return (
    <Link to={`mua-acc/${item?.slug}`} className="w-full">
      <div>
        <img
          className="w-full h-full min-w-[40px]
          min-h-[200px] border rounded-2xl inset-shadow-2xs block object-contain"
          src={`${import.meta.env.VITE_BACKEND_IMG}${item?.image}`}
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
    </Link>
  );
}
