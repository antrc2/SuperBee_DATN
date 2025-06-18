import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const effects3D = [
  {
    name: "cube",
    initial: (direction) => ({
      rotateY: direction * 90,
      z: -500,
      opacity: 0.5,
      transformPerspective: 1000,
    }),
    animate: { rotateY: 0, z: 0, opacity: 1, transformPerspective: 1000 },
    exit: (direction) => ({
      rotateY: direction * -90,
      z: -500,
      opacity: 0.5,
      transformPerspective: 1000,
    }),
  },
  {
    name: "flip",
    initial: (direction) => ({
      rotateX: direction * 90,
      opacity: 0,
      transformPerspective: 1000,
    }),
    animate: { rotateX: 0, opacity: 1, transformPerspective: 1000 },
    exit: (direction) => ({
      rotateX: direction * -90,
      opacity: 0,
      transformPerspective: 1000,
    }),
  },
  {
    name: "carousel",
    initial: (direction) => ({
      rotateY: direction * 45,
      x: direction * 1000,
      z: -500,
      opacity: 0,
      scale: 0.8,
      transformPerspective: 1500,
    }),
    animate: {
      rotateY: 0,
      x: 0,
      z: 0,
      opacity: 1,
      scale: 1,
      transformPerspective: 1500,
    },
    exit: (direction) => ({
      rotateY: direction * -45,
      x: direction * -1000,
      z: -500,
      opacity: 0,
      scale: 0.8,
      transformPerspective: 1500,
    }),
  },
  {
    name: "fold",
    initial: (direction) => ({
      originX: direction > 0 ? 0 : 1,
      scaleX: 0,
      opacity: 0,
      z: -100,
      rotateY: direction * 30,
      transformPerspective: 1000,
    }),
    animate: {
      scaleX: 1,
      opacity: 1,
      z: 0,
      rotateY: 0,
      transformPerspective: 1000,
    },
    exit: (direction) => ({
      originX: direction > 0 ? 1 : 0,
      scaleX: 0,
      opacity: 0,
      z: -100,
      rotateY: direction * -30,
      transformPerspective: 1000,
    }),
  },
  {
    name: "prism",
    initial: (direction) => ({
      rotateX: direction * 60,
      rotateY: direction * 60,
      rotateZ: direction * 60,
      scale: 0,
      opacity: 0,
      transformPerspective: 1200,
    }),
    animate: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      opacity: 1,
      transformPerspective: 1200,
    },
    exit: (direction) => ({
      rotateX: direction * -60,
      rotateY: direction * -60,
      rotateZ: direction * -60,
      scale: 0,
      opacity: 0,
      transformPerspective: 1200,
    }),
  },
];

const Banner3D = ({ banner }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [effectIndex, setEffectIndex] = useState(0);
  const nextEffect = useCallback(() => {
    setEffectIndex((prev) => (prev + 1) % effects3D.length);
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = (prev + 1) % banner.length;
      if (next === 0) nextEffect();
      return next;
    });
  }, [banner.length, nextEffect]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => {
      const next = (prev - 1 + banner.length) % banner.length;
      if (next === banner.length - 1) nextEffect();
      return next;
    });
  }, [banner.length, nextEffect]);

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

  const currentEffect = effects3D[effectIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div
        className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-xl bg-gradient-to-br from-gray-900 to-gray-800"
        style={{ perspective: 1500 }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={currentEffect.initial(direction)}
            animate={currentEffect.animate}
            exit={currentEffect.exit(direction)}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 origin-center"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <img
              // src={`${import.meta.env.VITE_BACKEND_IMG}${banner[currentIndex]}`}
              src={`${banner[currentIndex]?.image_url}`}
              alt={`Banner ${currentIndex + 1}`}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-8">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-white"
              >
                <h2 className="text-3xl font-bold tracking-tight">SuperBee</h2>
              </motion.div>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-white"
              >
                <p className="text-lg font-medium">Trải nghiệm mua hàng</p>
                <p className="text-sm opacity-80 mt-1">
                  mua hàng ngon, bổ, rẻ tại SuperBee
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={() => {
            prevSlide();
            handleInteraction();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => {
            nextSlide();
            handleInteraction();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <motion.div
            key={`progress-${currentIndex}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
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
                className={`block w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner3D;
