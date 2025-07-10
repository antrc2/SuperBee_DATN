"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Banner3D = ({ banner }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banner.length);
  }, [banner.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banner.length) % banner.length);
  }, [banner.length]);

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
    <div className="relative">
      {/* Main Banner */}
      <div className="relative h-48 md:min-h-[20rem] w-full overflow-hidden rounded-lg bg-slate-800 border border-slate-700">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction * 1000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -1000, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <img
              src={`${banner[currentIndex]?.image_url}`}
              alt={`Banner ${currentIndex + 1}`}
              className="object-cover w-full h-full block"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={() => {
            prevSlide();
            handleInteraction();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/80 text-white p-2 rounded-full transition-all duration-200 border border-slate-600 hover:border-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            nextSlide();
            handleInteraction();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/80 text-white p-2 rounded-full transition-all duration-200 border border-slate-600 hover:border-slate-500"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700">
          <motion.div
            key={`progress-${currentIndex}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-blue-500"
          />
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banner.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
                handleInteraction();
              }}
              className="group"
            >
              <span
                className={`block w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex
                    ? "bg-blue-400 scale-125"
                    : "bg-slate-500 group-hover:bg-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 2 ảnh phụ bên dưới banner */}
      <div className="grid md:grid-cols-2  gap-4 mt-4">
        <div className="relative h-32 md:h-40 overflow-hidden rounded-lg bg-slate-800 border border-slate-700">
          <img
            src={`${banner[1]?.image_url || banner[0]?.image_url}`}
            alt="Sub Banner 1"
            className="object-cover w-full h-full block"
            loading="lazy"
          />
        </div>
        <div className="relative h-32 md:h-40 overflow-hidden rounded-lg bg-slate-800 border border-slate-700">
          <img
            src={`${
              banner[2]?.image_url ||
              banner[1]?.image_url ||
              banner[0]?.image_url
            }`}
            alt="Sub Banner 2"
            className="object-cover w-full h-full block"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner3D;
