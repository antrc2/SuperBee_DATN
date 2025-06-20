import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ category }) {
  return (
    <div className="mb-6 ml-7">
      <nav
        aria-label="breadcrumb"
        className="flex items-center flex-wrap text-sm text-gray-400"
      >
        {/* Trang chủ */}
        <Link
          to="/"
          className="hover:text-purple-400 transition-colors duration-200"
        >
          Trang chủ
        </Link>

        <ChevronRight className="w-4 h-4 mx-1" />

        {/* Mua ACC */}
        <Link
          to="/mua-acc"
          className="hover:text-purple-400 transition-colors duration-200"
        >
          Mua ACC
        </Link>

        {category && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />

            <Link
              to={`/mua-acc/${category.slug}`}
              className="hover:text-purple-400 transition-colors duration-200 font-medium text-gray-200"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Tiêu đề danh mục */}
      {category && (
        <h1 className="text-2xl md:text-3xl font-semibold text-white pt-6">
          {category.name}
        </h1>
      )}
    </div>
  );
}
