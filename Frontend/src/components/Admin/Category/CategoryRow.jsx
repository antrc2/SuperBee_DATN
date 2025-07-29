// src/components/Admin/Category/CategoryRow.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, ChevronRight } from "lucide-react"; // Thêm icon ChevronRight
import Highlighter from "react-highlight-words";

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      status === 1
        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
    }`}
  >
    {status === 1 ? "Hoạt động" : "Ẩn"}
  </span>
);

export default function CategoryRow({
  category,
  level = 0,
  searchTerm,
  expandedIds,
  onToggle,
  onDelete,
}) {
  const indentStyle = { paddingLeft: `${level * 24 + 16}px` };
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.includes(category.id);

  return (
    <>
      <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
        <td className="px-4 py-3" style={indentStyle}>
          <div
            className="flex items-center gap-3"
            onClick={hasChildren ? () => onToggle(category.id) : undefined}
          >
            {/* Icon Dropdown */}
            {hasChildren ? (
              <ChevronRight
                size={16}
                className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            ) : (
              // Thêm một khoảng trống để các item thẳng hàng
              <span className="w-4"></span>
            )}

            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
            )}
            <span
              className={`font-medium text-slate-800 dark:text-slate-100 ${
                hasChildren ? "cursor-pointer" : ""
              }`}
              onClick={hasChildren ? () => onToggle(category.id) : undefined}
            >
              <Highlighter
                highlightClassName="bg-yellow-200 dark:bg-yellow-700 rounded-sm"
                searchWords={[searchTerm]}
                autoEscape={true}
                textToHighlight={category.name}
              />
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={category.status} />
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Link
              to={`/admin/categories/${category.id}/edit`}
              title="Chỉnh sửa"
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Pencil size={16} />
            </Link>
            <button
              title="Xóa"
              onClick={() => onDelete(category.id)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* Chỉ render các con nếu danh mục cha đang được mở */}
      {isExpanded &&
        hasChildren &&
        category.children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            level={level + 1}
            searchTerm={searchTerm}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}
