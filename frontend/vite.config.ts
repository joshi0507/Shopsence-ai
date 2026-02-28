import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import sourceIdentifierPlugin from "vite-plugin-source-identifier";

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: false,
      attributePrefix: "data-matrix",
      includeProps: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
