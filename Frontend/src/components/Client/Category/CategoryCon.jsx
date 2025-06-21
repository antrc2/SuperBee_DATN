import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import Image from "../Image/Image";

export default function CategoryCon({ item, isFlashSale = false }) {
  const formatAccountCount = (count) =>
    typeof count === "number" ? count.toLocaleString("vi-VN") : count || "0";

  const getCategoryColor = (name) => {
    const map = {
      blox: "#ff6b35",
      "free fire": "#ff4757",
      "liên quân": "#3742fa",
      valorant: "#e4405f",
      pubg: "#2ed573",
      roblox: "#5352ed",
    };
    for (let key in map) {
      if (name.toLowerCase().includes(key)) return map[key];
    }
    return "#8b5cf6";
  };
  const categoryColor = getCategoryColor(item?.name);

  return (
    <Link to={`/mua-acc/${item?.slug}`} className="block group">
      <div
        className={`
          relative aspect-square w-full
          rounded-2xl overflow-hidden
          border-2 border-transparent
          transition-transform duration-200
          hover:scale-105
        `}
        style={{
          borderImage: `linear-gradient(to right, ${categoryColor}, #fff) 1`,
        }}
      >
        {/* Ảnh: brighten on hover */}
        <Image
          url={item?.image}
          alt={item?.name}
          className="w-full h-full object-fill transition-filter duration-300 group-hover:filter group-hover:brightness-110"
        />

        {/* Nội dung phủ phía dưới */}
        <div
          className="absolute bottom-0 left-0 w-full px-4 py-3
                        bg-black/60 backdrop-blur-sm"
        >
          {/* Tên */}
          <h3
            className="text-lg font-bold text-white truncate"
            title={item?.name}
          >
            {item?.name}
          </h3>

          {/* Số tài khoản */}
          <div className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <Users className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {formatAccountCount(item?.count)} tài khoản
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
