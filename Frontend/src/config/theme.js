// Theme configuration for anime gaming style
export const themeConfig = {
  // Primary colors - Anime gaming palette
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Main primary
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    secondary: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef", // Main secondary (purple/pink)
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
    },
    accent: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316", // Orange accent
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
    neon: {
      blue: "#00f5ff",
      purple: "#bf00ff",
      pink: "#ff1493",
      green: "#00ff41",
      yellow: "#ffff00",
    },
    dark: {
      bg: "#0a0a0f",
      surface: "#1a1a2e",
      card: "#16213e",
      border: "#2d3748",
    },
  },

  // Typography
  fonts: {
    primary: '"Inter", "Noto Sans", sans-serif',
    heading: '"Poppins", "Inter", sans-serif',
    gaming: '"Orbitron", "Roboto Mono", monospace',
    japanese: '"Noto Sans JP", sans-serif',
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    neon: "linear-gradient(135deg, #00f5ff 0%, #bf00ff 100%)",
    gaming: "linear-gradient(135deg, #ff1493 0%, #00f5ff 50%, #bf00ff 100%)",
    dark: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
  },

  // Shadows and effects
  effects: {
    glow: {
      blue: "0 0 20px rgba(0, 245, 255, 0.5)",
      purple: "0 0 20px rgba(191, 0, 255, 0.5)",
      pink: "0 0 20px rgba(255, 20, 147, 0.5)",
    },
    shadow: {
      soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      medium:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      large: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      neon: "0 0 30px rgba(0, 245, 255, 0.3), 0 0 60px rgba(191, 0, 255, 0.2)",
    },
  },

  // Animation durations
  animation: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// CSS custom properties generator
export const generateCSSVariables = () => {
  const cssVars = {};

  // Colors
  Object.entries(themeConfig.colors).forEach(([colorName, colorValues]) => {
    if (typeof colorValues === "object") {
      Object.entries(colorValues).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value;
      });
    } else {
      cssVars[`--color-${colorName}`] = colorValues;
    }
  });

  // Fonts
  Object.entries(themeConfig.fonts).forEach(([fontName, fontValue]) => {
    cssVars[`--font-${fontName}`] = fontValue;
  });

  return cssVars;
};
