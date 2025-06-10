import { Link } from "react-router-dom";

export default function CategoryCha({ item }) {
  return (
    <Link to={`mua-acc/${item?.slug}`} className="w-full min-w-28 max-w-32">
      <div className="flex justify-center ">
        <img
          className=" object-cover w-14 h-14"
          src={`${import.meta.env.VITE_BACKEND_IMG}${item?.image_url}`}
        />
      </div>
      <div className="text-center text-[14px] p-2">
        {item?.name ?? "ACC FREE FIRE GIÁ RẺ"}
      </div>
    </Link>
  );
}
