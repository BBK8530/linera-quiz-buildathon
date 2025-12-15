import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        linera: "@linera/client",
      },
      preserveEntrySignatures: "strict",
    },
  },
  optimizeDeps: {
    exclude: ["@linera/client"],
  },
});
