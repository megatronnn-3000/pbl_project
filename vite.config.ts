import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    // Inline config stops Vite from resolving a postcss.config.js in a parent directory.
    postcss: { plugins: [] },
  },
  build: {
    target: "es2022",
    cssMinify: true,
  },
});
