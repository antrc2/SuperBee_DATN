/** @type {import('tailwindcss').Config} */
export default {
  // Quan trọng: Thêm chế độ 'class' để Tailwind có thể nhận diện class .dark
  darkMode: "class",
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Đường dẫn tới các file nguồn của bạn
    "./public/index.html",
  ],
  theme: {
    extend: {
      // 1. Áp dụng FONT CHỮ
      fontFamily: {
        // Tạo ra class: font-heading, font-body
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },

      // 2. Áp dụng MÀU SẮC
      colors: {
        // Sử dụng hàm rgb() với biến CSS để Tailwind có thể điều chỉnh độ trong suốt (opacity)
        // Ví dụ: class="bg-background/50" sẽ hoạt động
        background: "rgb(var(--color-background) / <alpha-value>)",
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-placeholder":
          "rgb(var(--color-text-placeholder) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-text": "rgb(var(--color-accent-text) / <alpha-value>)",
        highlight: "rgb(var(--color-highlight) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
        stroke: "rgb(var(--color-stroke) / <alpha-value>)",
        "main-white": "rgb(var(--color-main-white) / <alpha-value>)",
        "input-bg": "rgb(var(--color-input-bg) / <alpha-value>)",
        "input-text": "rgb(var(--color-input-text) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "border-hover": "rgb(var(--color-border-hover) / <alpha-value>)",
        "dropdown-bg": "rgb(var(--color-dropdown-bg) / <alpha-value>)",
        "notification-unread-bg":
          "rgb(var(--color-notification-unread-bg) / <alpha-value>)",
      },

      // 3. (Nâng cao) Áp dụng GRADIENT
      // Bạn có thể giữ nguyên gradient trong CSS hoặc định nghĩa lại ở đây
      backgroundImage: {
        // Tạo ra class: bg-gradient-header, bg-gradient-button, v.v.
        "gradient-header": "var(--gradient-header)",
        "gradient-button": "var(--gradient-button)",
        "gradient-logo": "var(--gradient-logo)",
        "gradient-danger": "var(--gradient-danger)",
        "gradient-success": "var(--gradient-success)",
        "gradient-warning": "var(--gradient-warning)",
        "gradient-info": "var(--gradient-info)",
      },
    },
  },
  plugins: [],
};
