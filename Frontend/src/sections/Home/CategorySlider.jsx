import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import CategoryCard from "../../components/Client/Category/CategoryCon";

export default function CategorySlider({ categories = [] }) {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const MAX_ITEMS_TO_DISPLAY = 9;
  const categoriesToDisplay = categories.slice(0, MAX_ITEMS_TO_DISPLAY);
  const shouldShowViewAllButton = categories.length > MAX_ITEMS_TO_DISPLAY;

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    // Thêm một khoảng chờ nhỏ để đảm bảo DOM đã render hoàn chỉnh trước khi tính toán
    const timer = setTimeout(checkScrollPosition, 100);

    container?.addEventListener("scroll", checkScrollPosition, {
      passive: true,
    });
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      clearTimeout(timer);
      container?.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [categories]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="section-bg">
      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary">
          Khám Phá Danh Mục
        </h2>
        <p className="text-secondary text-sm mt-2">
          Lựa chọn game yêu thích của bạn
        </p>
      </div>

      <div className="relative z-10">
        {/* --- NÚT ĐIỀU HƯỚNG RÕ NÉT HƠN --- */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute left-2 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-gradient-button border-2 border-themed rounded-full flex items-center justify-center text-primary shadow-lg transition-all duration-300 hover:text-highlight hover:border-accent hover:scale-110 disabled:opacity-0 disabled:pointer-events-none`}
          disabled={!canScrollLeft}
          aria-label="Lướt trái"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => handleScroll("right")}
          className={`absolute right-2 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-gradient-button border-2 border-themed rounded-full flex items-center justify-center text-primary shadow-lg transition-all duration-300 hover:text-highlight hover:border-accent hover:scale-110 disabled:opacity-0 disabled:pointer-events-none`}
          disabled={!canScrollRight && !shouldShowViewAllButton}
          aria-label="Lướt phải"
        >
          <ChevronRight size={24} />
        </button>

        {/* --- CONTAINER CUỘN ĐÃ ÁP DỤNG .scrollbar-hide --- */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth -m-2 p-2"
        >
          {categoriesToDisplay.map((category) => (
            <div
              key={category.id || category.slug}
              className="flex-shrink-0 w-[240px] sm:w-[260px]"
            >
              <CategoryCard item={category} />
            </div>
          ))}

          {/* Nút "Xem tất cả" */}
          {shouldShowViewAllButton && (
            <div className="flex-shrink-0 w-[240px] sm:w-[260px] flex items-center justify-center">
              <button
                onClick={() => navigate("/mua-acc")} // Cập nhật đường dẫn của bạn ở đây
                className="w-full h-full bg-content/50 border-2 border-dashed border-themed rounded-xl transition-all duration-300 hover:border-accent hover:text-accent text-secondary flex flex-col items-center justify-center"
              >
                <ArrowRight size={24} />
                <span className="font-heading text-sm font-semibold mt-2">
                  Xem tất cả
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
