import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@components": resolve(__dirname, "src/components"),
      // eslint-disable-next-line no-undef
      "@contexts": resolve(__dirname, "src/contexts"),
      // eslint-disable-next-line no-undef
      "@layouts": resolve(__dirname, "src/layouts"),
      // eslint-disable-next-line no-undef
      "@assets": resolve(__dirname, "src/assets"),
      // eslint-disable-next-line no-undef
      "@pages": resolve(__dirname, "src/pages"),
      // eslint-disable-next-line no-undef
      "@routers": resolve(__dirname, "src/routers"),
      // eslint-disable-next-line no-undef
      "@utils": resolve(__dirname, "src/utils")
    }
  },
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out"
      }
    }
  }
});
