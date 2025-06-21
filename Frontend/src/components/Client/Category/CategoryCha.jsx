import { Sparkles, Star } from "lucide-react";
import Image from "../Image/Image";
import { Link } from "react-router-dom";

export default function CategoryCha({ item, onClose }) {
  return (
    <Link to={`mua-acc/${item?.slug}`}>
      <div className="group relative w-full h-full " onClick={onClose}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 h-32 flex flex-col">
          {/* Neon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0  transition-opacity duration-300" />

          {/* Sparkle effects */}
          <div className="absolute top-2 right-2 text-yellow-400 opacity-0  transition-opacity duration-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="relative p-3 text-center flex-1 flex flex-col justify-center">
            {/* Category Icon/Image - make smaller */}
            <div className="relative mx-auto mb-2 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
              {item.image ? (
                <Image url={item.image} className={``} />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              )}

              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0  transition-opacity duration-300"
                style={{ padding: "2px" }}
              >
                <div className="w-full h-full rounded-lg bg-gray-900" />
              </div>
            </div>

            {/* Category Name - adjust text size */}
            <h3 className="font-bold text-xs text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
              {item.name}
            </h3>
          </div>

          {/* Animated border */}
          <div
            className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0  transition-opacity duration-300"
            style={{ padding: "1px" }}
          >
            <div className="w-full h-full rounded-2xl bg-gray-900/90" />
          </div>
        </div>
      </div>
    </Link>
  );
}
