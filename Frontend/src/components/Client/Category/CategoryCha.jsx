import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../Image/Image";

export default function CategoryCha({ item, onClose }) {
  const category = {
    name: item?.name || "Tên danh mục",
    slug: item?.slug || "category-slug",
    image: item?.image || "https://i.imgur.com/g0j4g4A.jpeg",
    count: item?.count || 0,
  };

  return (
    // 'group' và 'category-card-glow' vẫn được giữ lại để có hiệu ứng hover
    <Link
      to={`mua-acc/${category.slug}`}
      onClick={onClose}
      className="group block category-card-glow rounded-xl"
    >
      {/* Container chính, giờ đây có nền và viền từ theme.
        Bỏ chiều cao cố định để thẻ tự co giãn theo nội dung.
      */}
      <div className="relative w-full rounded-xl overflow-hidden bg-content border-themed">
        {/* Vùng chứa ảnh ở trên cùng */}
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            url={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>

        {/* Vùng chứa nội dung chữ ở dưới */}
        <div className="p-4">
          <h3 className="font-heading text-base font-bold text-primary truncate">
            {category.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-secondary">
            <Package size={16} />
            <span>
              <span className="font-bold">{category.count}</span> tài khoản
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
