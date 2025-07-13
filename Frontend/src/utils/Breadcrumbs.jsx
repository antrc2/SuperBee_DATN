// src/components/common/Breadcrumbs.jsx

import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4"
    >
      <div className="breadcrumbs-container">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {/* Nếu là phần tử cuối cùng, chỉ hiển thị text, không có link */}
            {index === items.length - 1 ? (
              <span className="font-semibold text-primary">{item.label}</span>
            ) : (
              <Link to={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            )}

            {/* Hiển thị dấu phân cách nếu không phải là phần tử cuối */}
            {index < items.length - 1 && (
              <ChevronRight size={16} className="breadcrumb-separator" />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
