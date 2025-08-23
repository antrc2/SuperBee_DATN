// File: src/utils/responsive.js - Responsive utilities and custom hooks

import { useState, useEffect, useCallback } from "react";

// Breakpoint constants following Tailwind CSS defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Device type detection
export const DEVICE_TYPES = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
};

// Custom hook for responsive behavior
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [deviceType, setDeviceType] = useState(DEVICE_TYPES.desktop);
  const [orientation, setOrientation] = useState("portrait");

  const updateSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setWindowSize({ width, height });

    // Determine device type
    if (width < BREAKPOINTS.md) {
      setDeviceType(DEVICE_TYPES.mobile);
    } else if (width < BREAKPOINTS.lg) {
      setDeviceType(DEVICE_TYPES.tablet);
    } else {
      setDeviceType(DEVICE_TYPES.desktop);
    }

    // Determine orientation
    setOrientation(width > height ? "landscape" : "portrait");
  }, []);

  useEffect(() => {
    updateSize();

    let timeoutId;
    const debouncedUpdateSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 150);
    };

    window.addEventListener("resize", debouncedUpdateSize);
    window.addEventListener("orientationchange", debouncedUpdateSize);

    return () => {
      window.removeEventListener("resize", debouncedUpdateSize);
      window.removeEventListener("orientationchange", debouncedUpdateSize);
      clearTimeout(timeoutId);
    };
  }, [updateSize]);

  const isMobile = deviceType === DEVICE_TYPES.mobile;
  const isTablet = deviceType === DEVICE_TYPES.tablet;
  const isDesktop = deviceType === DEVICE_TYPES.desktop;
  const isLandscape = orientation === "landscape";
  const isPortrait = orientation === "portrait";

  return {
    windowSize,
    deviceType,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    // Breakpoint helpers
    isSmUp: windowSize.width >= BREAKPOINTS.sm,
    isMdUp: windowSize.width >= BREAKPOINTS.md,
    isLgUp: windowSize.width >= BREAKPOINTS.lg,
    isXlUp: windowSize.width >= BREAKPOINTS.xl,
    is2XlUp: windowSize.width >= BREAKPOINTS["2xl"],
  };
};

// Custom hook for touch/mouse detection
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouch());
  }, []);

  return isTouchDevice;
};

// Utility functions for responsive calculations
export const getResponsiveValue = (values, currentWidth) => {
  const sortedBreakpoints = Object.entries(BREAKPOINTS).sort(
    ([, a], [, b]) => b - a
  ); // Sort descending

  for (const [breakpoint, width] of sortedBreakpoints) {
    if (currentWidth >= width && values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }

  return values.default || values[Object.keys(values)[0]];
};

// Chat positioning utility
export const getChatPositioning = (deviceType, isStaffOpen, isAIOpen) => {
  const baseClasses =
    "fixed z-50 shadow-2xl rounded-3xl overflow-hidden border border-themed animate-fade-in-up";

  switch (deviceType) {
    case DEVICE_TYPES.mobile:
      return {
        aiChat: `${baseClasses} inset-x-2 top-[10%] bottom-[120px] max-h-[80vh]`,
        staffChat: `${baseClasses} inset-x-2 top-[15%] bottom-[120px] max-h-[75vh]`,
        overlay: true,
      };

    case DEVICE_TYPES.tablet:
      return {
        aiChat:
          isStaffOpen && isAIOpen
            ? `${baseClasses} bottom-[120px] right-[420px] w-[380px] max-h-[70vh]`
            : `${baseClasses} bottom-[120px] right-4 w-[500px] max-h-[70vh]`,
        staffChat: `${baseClasses} bottom-[120px] right-4 w-[400px] max-h-[70vh]`,
        overlay: false,
      };

    default: // desktop
      return {
        aiChat:
          isStaffOpen && isAIOpen
            ? `${baseClasses} bottom-[120px] right-[440px] w-[600px] min-w-[500px] max-w-[800px] max-h-[80vh]`
            : `${baseClasses} bottom-[120px] right-4 w-[600px] min-w-[400px] max-w-[800px] max-h-[80vh]`,
        staffChat: `${baseClasses} bottom-[120px] right-4 w-[420px] min-w-[350px] max-w-[500px] max-h-[80vh]`,
        overlay: false,
      };
  }
};

// Safe area utilities
export const getSafeAreaStyles = () => {
  if (typeof window === "undefined") return {};

  const style = {};

  // Check if device supports safe areas (iOS Safari)
  if (CSS.supports("padding-top: env(safe-area-inset-top)")) {
    style.paddingTop = "env(safe-area-inset-top)";
    style.paddingBottom = "env(safe-area-inset-bottom)";
    style.paddingLeft = "env(safe-area-inset-left)";
    style.paddingRight = "env(safe-area-inset-right)";
  }

  return style;
};

// Viewport height utility for mobile browsers
export const getViewportHeight = () => {
  if (typeof window === "undefined") return "100vh";

  // Use CSS custom property if available
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  return "calc(var(--vh, 1vh) * 100)";
};

// Touch target size utility
export const getTouchTargetSize = (deviceType) => {
  switch (deviceType) {
    case DEVICE_TYPES.mobile:
      return "min-h-[44px] min-w-[44px]"; // iOS Human Interface Guidelines
    case DEVICE_TYPES.tablet:
      return "min-h-[48px] min-w-[48px]"; // Material Design Guidelines
    default:
      return "min-h-[40px] min-w-[40px]"; // Desktop can be smaller
  }
};

// Text scaling utility
export const getResponsiveTextSize = (baseSize, deviceType) => {
  const scales = {
    [DEVICE_TYPES.mobile]: 0.875, // 14px base
    [DEVICE_TYPES.tablet]: 1, // 16px base
    [DEVICE_TYPES.desktop]: 1, // 16px base
  };

  return `${baseSize * (scales[deviceType] || 1)}rem`;
};

// Spacing utility
export const getResponsiveSpacing = (size, deviceType) => {
  const multipliers = {
    [DEVICE_TYPES.mobile]: 0.75, // Tighter spacing on mobile
    [DEVICE_TYPES.tablet]: 1, // Standard spacing
    [DEVICE_TYPES.desktop]: 1.25, // More generous on desktop
  };

  return size * (multipliers[deviceType] || 1);
};

// Performance utilities
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return (...args) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(null, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Accessibility utilities
export const getAriaLabel = (action, state, deviceType) => {
  const devicePrefix =
    deviceType === DEVICE_TYPES.mobile ? "Chạm để " : "Nhấp để ";
  const stateText = state ? "đóng" : "mở";

  return `${devicePrefix}${stateText} ${action}`;
};

export const announceToScreenReader = (message) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Animation utilities
export const getReducedMotionPreference = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getAnimationClasses = (animationType) => {
  const hasReducedMotion = getReducedMotionPreference();

  if (hasReducedMotion) {
    return ""; // No animations for users who prefer reduced motion
  }

  const animations = {
    fadeIn: "animate-fade-in-up",
    fadeOut: "animate-fade-out-down",
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
  };

  return animations[animationType] || "";
};

// Export all utilities as default
export default {
  useResponsive,
  useTouchDevice,
  getResponsiveValue,
  getChatPositioning,
  getSafeAreaStyles,
  getViewportHeight,
  getTouchTargetSize,
  getResponsiveTextSize,
  getResponsiveSpacing,
  debounce,
  throttle,
  getAriaLabel,
  announceToScreenReader,
  getReducedMotionPreference,
  getAnimationClasses,
  BREAKPOINTS,
  DEVICE_TYPES,
};
