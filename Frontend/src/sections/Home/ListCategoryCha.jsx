import { useEffect, useRef, useState } from "react";
import CategoryCard from "../../components/Client/Category/CategoryCon";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Sparkles,
} from "lucide-react";
// Mock data for demonstration
const mockCategories = [
  {
    id: 1,
    name: "Thung Lũng Gió",
    slug: "thung-lung-gio",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    description:
      "Khám phá một thế giới kỳ diệu và bình yên với những tài khoản chất lượng cao.",
    count: 85,
  },
  {
    id: 2,
    name: "Liên Quân Mobile",
    slug: "lien-quan-mobile",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    description: "Tham gia chiến trường MOBA hấp dẫn nhất trên mobile.",
    count: 124,
  },
  {
    id: 3,
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    image:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
    description: "Trải nghiệm battle royale đỉnh cao với đồ họa tuyệt đẹp.",
    count: 98,
  },
  {
    id: 4,
    name: "Free Fire",
    slug: "free-fire",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    description: "Game bắn súng sinh tồn nhanh gọn, phù hợp mọi thiết bị.",
    count: 156,
  },
  {
    id: 5,
    name: "Genshin Impact",
    slug: "genshin-impact",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    description: "Thế giới mở phiêu lưu với đồ họa anime tuyệt đẹp.",
    count: 67,
  },
  {
    id: 6,
    name: "Valorant",
    slug: "valorant",
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
    description: "FPS chiến thuật đỉnh cao với gameplay căng thẳng.",
    count: 89,
  },
];
export default function CategorySlider({ categories = mockCategories }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const MAX_DISPLAY = 12;
  const visibleCategories = categories.slice(0, MAX_DISPLAY);
  const shouldShowButtons = categories.length > 1;

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      return () =>
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      if (!hasInteracted) setHasInteracted(true);

      const container = scrollContainerRef.current;
      const cardWidth =
        container.querySelector(".flex-shrink-0")?.offsetWidth || 320;
      const gap = 24; // 1.5rem = 24px
      const scrollAmount = (cardWidth + gap) * 2; // Scroll 2 cards at a time

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Danh Mục Game
            </h2>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Khám phá thế giới game đa dạng với những tài khoản chất lượng cao
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {shouldShowButtons && (
            <>
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-cyan-500/80 hover:border-cyan-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/90 disabled:hover:border-gray-600 disabled:hover:scale-100 shadow-lg z-99 ${
                  canScrollLeft ? "block" : "hidden"
                } `}
                aria-label="Lướt sang trái"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-99 w-12 h-12 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-cyan-500/80 hover:border-cyan-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/90 disabled:hover:border-gray-600 disabled:hover:scale-100 shadow-lg  ${
                  canScrollRight ? "block" : "hidden"
                }`}
                aria-label="Lướt sang phải"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide  scroll-smooth "
          >
            {visibleCategories.map((category, index) => (
              <CategoryCard
                key={index}
                item={category}
                onClick={() => setHasInteracted(true)}
              />
            ))}
          </div>
        </div>

        {!canScrollRight && (
          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => console.log("Navigate to all categories")}
              className="inline-flex items-center gap-3 px-6 py-3 font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl shadow-lg hover:scale-105 hover:shadow-cyan-500/30 transition-all duration-300 hover:from-cyan-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              Xem tất cả danh mục
              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
