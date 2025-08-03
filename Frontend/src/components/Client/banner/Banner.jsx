"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Ảnh mặc định sẽ được sử dụng nếu không đủ banner
const placeholderBanner = {
  id: "placeholder",
  image_url: "https://i.imgur.com/g0j4g4A.jpeg",
  alt: "SuperBee Store",
};

const Banner3D = ({ banner = [] }) => {
  // Logic để đảm bảo luôn có 3 banner để hiển thị
  const displayBanners = [...banner];
  while (displayBanners.length < 3) {
    displayBanners.push({
      ...placeholderBanner,
      id: `placeholder-${displayBanners.length}`,
    });
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Xác định 2 banner phụ dựa trên banner chính hiện tại
  const subBanner1Index = (currentIndex + 1) % displayBanners.length;
  const subBanner2Index = (currentIndex + 2) % displayBanners.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + displayBanners.length) % displayBanners.length
    );
  }, [displayBanners.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    const timeout = setTimeout(() => setIsAutoPlaying(true), 10000);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="relative h-full">
      {/* Main Banner */}
      <div className="relative h-48 md:min-h-[20rem] w-full overflow-hidden rounded-2xl bg-content border-themed">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -300, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={displayBanners[currentIndex].image_url}
              alt={
                displayBanners[currentIndex].alt || `Banner ${currentIndex + 1}`
              }
              className="object-cover w-full h-full block"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => {
            prevSlide();
            handleInteraction();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/40 text-primary rounded-full transition-all p-2  backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            nextSlide();
            handleInteraction();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/40 text-primary rounded-full transition-all p-2  backdrop-blur-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 left-0 right-0 px-4">
          <div className="flex items-center justify-center space-x-2">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                  handleInteraction();
                }}
                className="group p-1"
              >
                <span
                  className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "bg-highlight scale-125"
                      : "bg-secondary/50 group-hover:bg-secondary"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="absolute -bottom-2.5 left-0 w-full h-1 bg-primary/10 overflow-hidden">
            <motion.div
              key={`progress-${currentIndex}`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-highlight"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 gap-4 mt-4">
        <div className="relative h-32 md:h-40 overflow-hidden rounded-2xl bg-content border-themed">
          <img
            src={displayBanners[subBanner1Index].image_url}
            alt={displayBanners[subBanner1Index].alt || "Sub Banner 1"}
            className="object-cover w-full h-full block"
            loading="lazy"
          />
        </div>
        <div className="relative h-32 md:h-40 overflow-hidden rounded-2xl bg-content border-themed">
          <img
            src={displayBanners[subBanner2Index].image_url}
            alt={displayBanners[subBanner2Index].alt || "Sub Banner 2"}
            className="object-cover w-full h-full block"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner3D;
