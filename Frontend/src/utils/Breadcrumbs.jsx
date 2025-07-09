import { Link } from "react-router-dom";
import { ChevronRight, Home, ShoppingCart } from "lucide-react"; // Assuming you have these or similar icons

export default function Breadcrumbs({ category }) {
  return (
    <div className="p-4">
      <nav
        aria-label="breadcrumb"
        className="flex items-center flex-wrap text-base text-gray-300" // Increased base font size
      >
        {/* Trang chủ */}
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-purple-400 transition-colors duration-200"
        >
          <Home className="w-5 h-5" /> {/* Larger, cute home icon */}
          <span className="font-medium">Trang chủ</span>{" "}
          {/* Slightly bolder text */}
        </Link>
        <ChevronRight className="w-5 h-5 mx-2 text-gray-500" />{" "}
        {/* Larger, slightly darker chevron */}
        {/* Mua ACC */}
        <Link
          to="/mua-acc"
          className="flex items-center gap-1 hover:text-purple-400 transition-colors duration-200"
        >
          <ShoppingCart className="w-5 h-5" />{" "}
          {/* Larger, cute shopping cart icon */}
          <span className="font-medium">Mua ACC</span>{" "}
          {/* Slightly bolder text */}
        </Link>
        {category && (
          <>
            <ChevronRight className="w-5 h-5 mx-2 text-gray-500" />{" "}
            {/* Larger, slightly darker chevron */}
            <Link
              to={`/mua-acc/${category.slug}`}
              className="font-semibold text-purple-400" // Highlight current category
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
